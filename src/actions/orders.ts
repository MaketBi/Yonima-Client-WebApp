'use server';

import { createServerClient } from '@/lib/supabase/server';
import type { Order, PaymentMethod } from '@/types/models';

// ============================================
// TYPES FOR ORDER AND PAYMENT
// ============================================

export interface OrderItemRequest {
  productId?: string;
  packId?: string;
  quantity: number;
  unitPrice: number;
  itemName: string;
  itemType: 'product' | 'pack';
}

export interface DeliveryAddressData {
  formattedAddress: string;
  latitude?: number;
  longitude?: number;
  additionalInfo?: string;
}

export interface CreateOrderRequest {
  vendor_id: string;
  items: OrderItemRequest[];
  delivery_address: DeliveryAddressData;
  payment_method: PaymentMethod;
  subtotal: number;
  delivery_fee: number;
  total: number;
  promo_id?: string;
  promo_code?: string;
  promo_discount?: number;
}

export interface CreateOrderResponse {
  success: boolean;
  order_id?: string;
  order_number?: string;
  error?: string;
  out_of_stock?: boolean;
  item_name?: string;
  available_stock?: number;
}

export interface InitiatePaymentRequest {
  amount: number;
  payment_method: 'wave' | 'orange_money';
  customer_name: string;
  customer_phone: string;
  order_data: {
    vendor_id: string;
    items: OrderItemRequest[];
    delivery_address: DeliveryAddressData;
    subtotal: number;
    delivery_fee: number;
    total: number;
    promo_id?: string;
    promo_code?: string;
    promo_discount?: number;
  };
}

export interface InitiatePaymentResponse {
  success: boolean;
  payment_id?: string;
  payment_token?: string;
  redirect_url?: string;
  qr_code_url?: string;
  fees?: number;
  // Sandbox instant payment
  instant_payment?: boolean;
  order_id?: string;
  order_number?: string;
  error?: string;
}

export interface CheckPaymentStatusResponse {
  success: boolean;
  status?: 'pending' | 'paid' | 'failed' | 'cancelled' | 'expired';
  order_id?: string;
  order_number?: string;
  error?: string;
}

/**
 * Get orders for the current user
 */
export async function getUserOrders(): Promise<Order[]> {
  try {
    const supabase = await createServerClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from('orders')
      .select('*, vendor:vendors(id, name, logo_url)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      return [];
    }

    return data as Order[];
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
}

/**
 * Get a single order by ID
 */
export async function getOrder(orderId: string): Promise<Order | null> {
  try {
    const supabase = await createServerClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return null;
    }

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        vendor:vendors(id, name, logo_url, phone, address),
        order_items(*)
      `)
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching order:', error);
      return null;
    }

    return data as Order;
  } catch (error) {
    console.error('Error fetching order:', error);
    return null;
  }
}

/**
 * Get active orders for the current user (not delivered or cancelled)
 */
export async function getActiveOrders(): Promise<Order[]> {
  try {
    const supabase = await createServerClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from('orders')
      .select('*, vendor:vendors(id, name, logo_url)')
      .eq('user_id', user.id)
      .not('status', 'in', '("delivered","cancelled")')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching active orders:', error);
      return [];
    }

    return data as Order[];
  } catch (error) {
    console.error('Error fetching active orders:', error);
    return [];
  }
}

// ============================================
// ORDER CREATION (Cash payments)
// ============================================

/**
 * Create an order with cash payment
 */
export async function createOrder(request: CreateOrderRequest): Promise<CreateOrderResponse> {
  try {
    const supabase = await createServerClient();

    // Get the session for the auth token
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { success: false, error: 'Non authentifié' };
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-order`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          vendorId: request.vendor_id,
          items: request.items,
          deliveryAddress: {
            formattedAddress: request.delivery_address.formattedAddress,
            latitude: request.delivery_address.latitude || 0,
            longitude: request.delivery_address.longitude || 0,
            additionalInfo: request.delivery_address.additionalInfo,
          },
          paymentMethod: request.payment_method,
          subtotal: request.subtotal,
          deliveryFee: request.delivery_fee,
          total: request.total,
          promoId: request.promo_id,
          promoCode: request.promo_code,
          promoDiscount: request.promo_discount,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Erreur lors de la création de la commande',
        out_of_stock: data.outOfStock,
        item_name: data.itemName,
        available_stock: data.availableStock,
      };
    }

    return {
      success: true,
      order_id: data.orderId,
      order_number: data.orderNumber,
    };
  } catch (error) {
    console.error('Error creating order:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur de connexion',
    };
  }
}

// ============================================
// MOBILE PAYMENT (Wave, Orange Money)
// ============================================

/**
 * Initiate a mobile payment (Wave or Orange Money)
 * This creates a pending payment and returns a redirect URL for the user to complete payment
 */
export async function initiatePayment(request: InitiatePaymentRequest): Promise<InitiatePaymentResponse> {
  try {
    const supabase = await createServerClient();

    // Get the session for the auth token
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { success: false, error: 'Non authentifié' };
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/mobile-payment`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          amount: request.amount,
          paymentMethod: request.payment_method,
          customerName: request.customer_name,
          customerPhone: request.customer_phone,
          orderData: {
            vendorId: request.order_data.vendor_id,
            items: request.order_data.items,
            deliveryAddress: {
              formattedAddress: request.order_data.delivery_address.formattedAddress,
              latitude: request.order_data.delivery_address.latitude || 0,
              longitude: request.order_data.delivery_address.longitude || 0,
              additionalInfo: request.order_data.delivery_address.additionalInfo,
            },
            subtotal: request.order_data.subtotal,
            deliveryFee: request.order_data.delivery_fee,
            total: request.order_data.total,
            promoId: request.order_data.promo_id,
            promoCode: request.order_data.promo_code,
            promoDiscount: request.order_data.promo_discount,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      return {
        success: false,
        error: data.error || 'Erreur lors de l\'initiation du paiement',
      };
    }

    return {
      success: true,
      payment_id: data.paymentId,
      payment_token: data.paymentToken,
      redirect_url: data.redirectUrl,
      qr_code_url: data.qrCodeUrl,
      fees: data.fees,
      instant_payment: data.instantPayment,
      order_id: data.orderId,
      order_number: data.orderNumber,
    };
  } catch (error) {
    console.error('Error initiating payment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur de connexion',
    };
  }
}

/**
 * Check the status of a pending payment
 */
export async function checkPaymentStatus(paymentId: string): Promise<CheckPaymentStatusResponse> {
  try {
    const supabase = await createServerClient();

    // Get the session for the auth token
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { success: false, error: 'Non authentifié' };
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/check-payment-status`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ paymentId }),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      return {
        success: false,
        error: data.error || 'Erreur lors de la vérification du paiement',
      };
    }

    return {
      success: true,
      status: data.status,
      order_id: data.orderId,
      order_number: data.orderNumber,
    };
  } catch (error) {
    console.error('Error checking payment status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur de connexion',
    };
  }
}

