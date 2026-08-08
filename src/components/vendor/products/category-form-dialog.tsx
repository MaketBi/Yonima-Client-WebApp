'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { VendorImagePicker } from '@/components/vendor/vendor-image-picker';
import { useToast } from '@/hooks/use-toast';
import {
  createVendorCategory,
  updateVendorCategory,
  type CategoryFormValues,
  type VendorCategoryRow,
} from '@/actions/vendor-categories';
import type { MenuCategoryRef } from '@/types/vendor';

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kinds: MenuCategoryRef[];
  /** Absent = création. */
  category?: VendorCategoryRow;
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  kinds,
  category,
}: CategoryFormDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEdit = !!category;

  const [menuCategoryId, setMenuCategoryId] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Préremplissage à l'ouverture.
  // ⚠️ On lit `display_name` brut, pas le `name` résolu par la RPC : l'app iOS
  // laisse ce champ vide, ce qui EFFACE le nom personnalisé à chaque édition.
  useEffect(() => {
    if (!open) return;

    setMenuCategoryId(category?.menu_category_id ?? '');
    setDisplayName(category?.display_name ?? '');
    setDescription(category?.description ?? '');
    setImageUrl(category?.image_url ?? null);
    setSortOrder(
      category?.sort_order != null ? String(category.sort_order) : ''
    );
    setError(null);
  }, [open, category]);

  const handleSubmit = useCallback(async () => {
    if (isSaving) return;

    setIsSaving(true);
    setError(null);

    const values: CategoryFormValues = {
      menuCategoryId,
      displayName: displayName.trim() || null,
      description: description.trim() || null,
      imageUrl,
      sortOrder: sortOrder ? Number(sortOrder) : null,
    };

    try {
      const result = isEdit
        ? await updateVendorCategory(category.id, values)
        : await createVendorCategory(values);

      if (!result.success) {
        setError(result.error ?? "L'enregistrement a échoué");
        return;
      }

      toast({
        title: isEdit ? 'Catégorie modifiée' : 'Catégorie créée',
      });
      onOpenChange(false);
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  }, [
    isSaving,
    menuCategoryId,
    displayName,
    description,
    imageUrl,
    sortOrder,
    isEdit,
    category,
    onOpenChange,
    router,
    toast,
  ]);

  const currentKindName =
    kinds.find((kind) => kind.id === menuCategoryId)?.name ?? '—';

  const isValid = isEdit || !!menuCategoryId;

  return (
    <Dialog open={open} onOpenChange={(next) => !isSaving && onOpenChange(next)}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
          </DialogTitle>
          <DialogDescription>
            Les catégories organisent votre menu côté client.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label className="text-[13px] font-semibold">Image</Label>
            <VendorImagePicker
              value={imageUrl}
              onChange={setImageUrl}
              target="category"
              height={120}
              placeholder="Ajoutez une image"
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[13px] font-semibold">
              Type de catégorie *
            </Label>
            {isEdit ? (
              <>
                <p className="rounded-xl bg-neutral-100 px-4 py-3 text-[15px] font-semibold">
                  {currentKindName}
                </p>
                <p className="text-[12px] text-ink-muted">
                  Le type ne peut pas être modifié. Pour changer, supprimez puis
                  recréez.
                </p>
              </>
            ) : (
              <>
                <Select
                  value={menuCategoryId}
                  onValueChange={setMenuCategoryId}
                  disabled={isSaving || kinds.length === 0}
                >
                  <SelectTrigger className="h-[50px] rounded-xl">
                    <SelectValue placeholder="Choisissez un type" />
                  </SelectTrigger>
                  <SelectContent>
                    {kinds.map((kind) => (
                      <SelectItem key={kind.id} value={kind.id}>
                        {kind.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[12px] text-ink-muted">
                  Choisissez le rôle de cette section dans votre menu.
                </p>
              </>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName" className="text-[13px] font-semibold">
              Nom personnalisé (optionnel)
            </Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="ex: Pizzas Classiques"
              className="h-[50px] rounded-xl"
              disabled={isSaving}
            />
            <p className="text-[12px] text-ink-muted">
              Laissez vide pour utiliser le nom par défaut du type choisi.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoryDesc" className="text-[13px] font-semibold">
              Description
            </Label>
            <Textarea
              id="categoryDesc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez cette catégorie…"
              rows={2}
              className="rounded-xl"
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sortOrder" className="text-[13px] font-semibold">
              Position dans le menu
            </Label>
            <Input
              id="sortOrder"
              type="text"
              inputMode="numeric"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value.replace(/\D/g, ''))}
              placeholder="1"
              className="h-[50px] rounded-xl"
              disabled={isSaving}
            />
            <p className="text-[12px] text-ink-muted">
              Plus petit = affiché en premier. Laissez vide pour ajouter à la fin.
            </p>
          </div>

          {error && (
            <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
            className="sm:flex-1"
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid || isSaving}
            className="sm:flex-1"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enregistrement…
              </>
            ) : (
              'Enregistrer'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
