'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FolderOpen, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CategoryFormDialog } from './category-form-dialog';
import { deleteVendorCategory, type VendorCategoryRow } from '@/actions/vendor-categories';
import { VENDOR_ROUTES } from '@/lib/vendor/constants';
import type { MenuCategoryRef } from '@/types/vendor';

interface CategoriesViewProps {
  categories: VendorCategoryRow[];
  kinds: MenuCategoryRef[];
  /** Nombre de produits par `vendor_menu_category_id`. */
  productCounts: Record<string, number>;
  canManage: boolean;
}

export function CategoriesView({
  categories,
  kinds,
  productCounts,
  canManage,
}: CategoriesViewProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<VendorCategoryRow | undefined>();
  const [pendingDelete, setPendingDelete] = useState<VendorCategoryRow | null>(null);
  const [isPending, startTransition] = useTransition();

  const kindName = (category: VendorCategoryRow) =>
    kinds.find((kind) => kind.id === category.menu_category_id)?.name ?? '—';

  const openCreate = () => {
    setEditing(undefined);
    setShowForm(true);
  };

  const openEdit = (category: VendorCategoryRow) => {
    setEditing(category);
    setShowForm(true);
  };

  const handleDelete = () => {
    if (!pendingDelete) return;

    startTransition(async () => {
      const result = await deleteVendorCategory(pendingDelete.id);
      if (!result.success) {
        toast({
          title: 'La suppression a échoué',
          description: result.error,
          variant: 'destructive',
        });
        return;
      }
      toast({ title: 'Catégorie supprimée' });
      setPendingDelete(null);
      router.refresh();
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={VENDOR_ROUTES.produits}
          className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-ink-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Retour au catalogue
        </Link>

        {canManage && (
          <Button onClick={openCreate} className="h-11 rounded-xl">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle catégorie
          </Button>
        )}
      </div>

      {!canManage && (
        <p className="rounded-xl bg-green-50 px-4 py-3 text-[13px] text-green-deep">
          Seul le propriétaire de la boutique peut gérer les catégories.
        </p>
      )}

      {categories.length === 0 ? (
        <div className="flex flex-col items-center rounded-[18px] bg-white px-6 py-16 text-center shadow-card">
          <FolderOpen className="h-10 w-10 text-neutral-500" aria-hidden="true" />
          <h2 className="mt-4 text-[17px] font-bold">Aucune catégorie</h2>
          <p className="mt-1 text-[14px] text-ink-muted">
            Créez des catégories pour organiser vos produits.
          </p>
          {canManage && (
            <Button onClick={openCreate} className="mt-5 rounded-xl">
              <Plus className="mr-2 h-4 w-4" />
              Ajouter une catégorie
            </Button>
          )}
        </div>
      ) : (
        <ul className="space-y-3">
          {categories.map((category) => {
            const count = productCounts[category.id] ?? 0;

            return (
              <li
                key={category.id}
                className="flex items-center gap-4 rounded-2xl border border-neutral-300 bg-white p-4"
              >
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                  {category.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={category.image_url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center">
                      <FolderOpen
                        className="h-5 w-5 text-neutral-500"
                        aria-hidden="true"
                      />
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-[15.5px] font-bold">
                    {category.display_name || kindName(category)}
                  </h3>
                  <p className="text-[12.5px] text-ink-muted">
                    {kindName(category)} · {count} produit{count > 1 ? 's' : ''}
                  </p>
                  {category.description && (
                    <p className="mt-0.5 truncate text-[12.5px] text-ink-muted">
                      {category.description}
                    </p>
                  )}
                </div>

                <span className="shrink-0 rounded-pill bg-neutral-100 px-2.5 py-1 text-[11px] font-bold text-ink-muted">
                  #{category.sort_order}
                </span>

                {canManage && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="rounded-lg p-1 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-ink"
                        aria-label={`Actions pour ${category.display_name || kindName(category)}`}
                        disabled={isPending}
                      >
                        <MoreHorizontal className="h-5 w-5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => openEdit(category)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => setPendingDelete(category)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <CategoryFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        kinds={kinds}
        category={editing}
      />

      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette catégorie ?</AlertDialogTitle>
            <AlertDialogDescription>
              Les produits de cette catégorie ne seront pas supprimés, mais
              perdront leur affectation.
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
    </div>
  );
}
