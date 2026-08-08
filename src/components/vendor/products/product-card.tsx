'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { formatStatsAmount } from '@/lib/vendor/format';
import { VENDOR_ROUTES } from '@/lib/vendor/constants';
import {
  deleteVendorProduct,
  toggleProductAvailability,
} from '@/actions/vendor-products';
import type { VendorProduct } from '@/types/vendor';

interface ProductCardProps {
  product: VendorProduct;
  canManage: boolean;
}

export function ProductCard({ product, canManage }: ProductCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [showDelete, setShowDelete] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      const result = await toggleProductAvailability(
        product.id,
        !product.is_available
      );
      if (!result.success) {
        toast({
          title: 'La mise à jour a échoué',
          description: result.error,
          variant: 'destructive',
        });
        return;
      }
      toast({
        title: product.name,
        description: product.is_available ? 'Masqué' : 'Affiché',
      });
      router.refresh();
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteVendorProduct(product.id);
      if (!result.success) {
        toast({
          title: 'La suppression a échoué',
          description: result.error,
          variant: 'destructive',
        });
        return;
      }
      toast({ title: 'Produit supprimé', description: product.name });
      setShowDelete(false);
      router.refresh();
    });
  };

  return (
    <>
      <article
        className={cn(
          'flex gap-4 rounded-2xl border border-neutral-300 bg-white p-3.5 transition-opacity',
          !product.is_available && 'opacity-60'
        )}
      >
        <div className="h-[70px] w-[70px] shrink-0 overflow-hidden rounded-[14px] bg-neutral-100">
          {product.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt=""
              className="h-full w-full object-cover"
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15.5px] font-bold tracking-[-0.01em]">
            {product.name}
          </h3>
          {product.description && (
            <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-ink-muted">
              {product.description}
            </p>
          )}
          <p className="mt-2 text-[16px] font-bold text-green-forest">
            {formatStatsAmount(product.price)}
          </p>
        </div>

        <div className="flex flex-col items-end justify-between">
          {canManage ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="rounded-lg p-1 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-ink"
                  aria-label={`Actions pour ${product.name}`}
                  disabled={isPending}
                >
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onSelect={() =>
                    router.push(`${VENDOR_ROUTES.produits}/${product.id}`)
                  }
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={handleToggle}>
                  {product.is_available ? (
                    <>
                      <EyeOff className="mr-2 h-4 w-4" />
                      Masquer
                    </>
                  ) : (
                    <>
                      <Eye className="mr-2 h-4 w-4" />
                      Afficher
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => setShowDelete(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <span />
          )}

          <span
            className={cn(
              'inline-flex items-center gap-1.5 text-[12px] font-semibold',
              product.is_available ? 'text-green-deep' : 'text-neutral-500'
            )}
          >
            <span
              className={cn(
                'h-2.5 w-2.5 rounded-full',
                product.is_available ? 'bg-green-electric' : 'bg-neutral-500'
              )}
            />
            {product.is_available ? 'Dispo' : 'Masqué'}
          </span>
        </div>
      </article>

      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce produit ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. « {product.name} » sera retiré
              définitivement de votre catalogue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
