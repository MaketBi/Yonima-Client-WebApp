'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useCartStore } from '@/stores/cart-store';

interface CartVendorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentVendorName: string;
  newVendorName: string;
  onConfirm: () => void;
}

export function CartVendorDialog({
  open,
  onOpenChange,
  currentVendorName,
  newVendorName,
  onConfirm,
}: CartVendorDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-[320px] rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Vider le panier ?</AlertDialogTitle>
          <AlertDialogDescription>
            Votre panier contient des articles de <span className="font-medium text-foreground">{currentVendorName}</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row gap-2">
          <AlertDialogCancel className="flex-1 mt-0">
            Garder
          </AlertDialogCancel>
          <AlertDialogAction className="flex-1" onClick={onConfirm}>
            Vider et ajouter
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
