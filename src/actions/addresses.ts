'use server';

import { createServerClient } from '@/lib/supabase/server';
import type { DeliveryAddress } from '@/types/models';

/**
 * Get all saved delivery addresses for the current user
 */
export async function getUserAddresses(): Promise<DeliveryAddress[]> {
  try {
    const supabase = await createServerClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from('delivery_addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching addresses:', error);
      return [];
    }

    return data as DeliveryAddress[];
  } catch (error) {
    console.error('Error fetching addresses:', error);
    return [];
  }
}

/**
 * Get the default delivery address for the current user
 */
export async function getDefaultAddress(): Promise<DeliveryAddress | null> {
  try {
    const supabase = await createServerClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return null;
    }

    const { data, error } = await supabase
      .from('delivery_addresses')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_default', true)
      .single();

    if (error) {
      // Try to get the most recent address if no default
      const { data: recentData } = await supabase
        .from('delivery_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      return recentData as DeliveryAddress | null;
    }

    return data as DeliveryAddress;
  } catch (error) {
    console.error('Error fetching default address:', error);
    return null;
  }
}

/**
 * Save a new delivery address for the current user
 */
export async function saveAddress(address: {
  label?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  additional_info?: string;
  is_default?: boolean;
}): Promise<{ success: boolean; address?: DeliveryAddress; error?: string }> {
  try {
    const supabase = await createServerClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Non authentifié' };
    }

    // If setting as default, unset other defaults first
    if (address.is_default) {
      await supabase
        .from('delivery_addresses')
        .update({ is_default: false })
        .eq('user_id', user.id);
    }

    const { data, error } = await supabase
      .from('delivery_addresses')
      .insert({
        user_id: user.id,
        label: address.label || null,
        address: address.address,
        latitude: address.latitude || null,
        longitude: address.longitude || null,
        additional_info: address.additional_info || null,
        is_default: address.is_default || false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving address:', error);
      return { success: false, error: error.message };
    }

    return { success: true, address: data as DeliveryAddress };
  } catch (error) {
    console.error('Error saving address:', error);
    return { success: false, error: 'Erreur lors de la sauvegarde' };
  }
}

/**
 * Update an existing delivery address
 */
export async function updateAddress(
  addressId: string,
  updates: {
    label?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    additional_info?: string;
    is_default?: boolean;
  }
): Promise<{ success: boolean; address?: DeliveryAddress; error?: string }> {
  try {
    const supabase = await createServerClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Non authentifié' };
    }

    // If setting as default, unset other defaults first
    if (updates.is_default) {
      await supabase
        .from('delivery_addresses')
        .update({ is_default: false })
        .eq('user_id', user.id);
    }

    const { data, error } = await supabase
      .from('delivery_addresses')
      .update({
        ...updates,
        additional_info: updates.additional_info || null,
      })
      .eq('id', addressId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating address:', error);
      return { success: false, error: error.message };
    }

    return { success: true, address: data as DeliveryAddress };
  } catch (error) {
    console.error('Error updating address:', error);
    return { success: false, error: 'Erreur lors de la mise à jour' };
  }
}

/**
 * Delete a delivery address
 */
export async function deleteAddress(addressId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Non authentifié' };
    }

    const { error } = await supabase
      .from('delivery_addresses')
      .delete()
      .eq('id', addressId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting address:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting address:', error);
    return { success: false, error: 'Erreur lors de la suppression' };
  }
}
