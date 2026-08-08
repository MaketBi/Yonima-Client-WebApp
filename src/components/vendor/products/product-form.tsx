'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Lightbulb, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { VendorImagePicker } from '@/components/vendor/vendor-image-picker';
import { useToast } from '@/hooks/use-toast';
import { formatStatsAmount } from '@/lib/vendor/format';
import { VENDOR_ROUTES } from '@/lib/vendor/constants';
import {
  createVendorProduct,
  previewSalePrice,
  updateVendorProduct,
  type ProductFormValues,
} from '@/actions/vendor-products';
import {
  PRODUCT_UNITS,
  usesSaleUnit,
  usesStockManagement,
  type VendorMenuCategory,
  type VendorProduct,
} from '@/types/vendor';

interface ProductFormProps {
  categories: VendorMenuCategory[];
  vendorType: string | null;
  /** Absent = création. */
  product?: VendorProduct;
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-neutral-300 bg-white p-6">
      <h2 className="mb-4 text-[11.5px] font-bold uppercase tracking-[0.14em] text-ink-muted">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function ProductForm({ categories, vendorType, product }: ProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEdit = !!product;

  const [name, setName] = useState(product?.name ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  // ⚠️ En édition on préremplit depuis `vendor_net_price`, jamais `price` —
  // sinon on ré-enregistrerait un net gonflé de la commission.
  const [netPrice, setNetPrice] = useState(
    product ? String(Math.round(product.vendor_net_price ?? product.price)) : ''
  );
  const [unit, setUnit] = useState(product?.unit ?? 'Unité');
  const [stockQuantity, setStockQuantity] = useState(
    product?.stock_quantity != null ? String(product.stock_quantity) : ''
  );
  const [isAvailable, setIsAvailable] = useState(product?.is_available ?? true);
  const [imageUrl, setImageUrl] = useState<string | null>(
    product?.image_url ?? null
  );
  const [categoryId, setCategoryId] = useState(
    product?.vendor_menu_category_id ?? ''
  );

  const [salePreview, setSalePreview] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const showUnit = usesSaleUnit(vendorType);
  const showStock = usesStockManagement(vendorType);

  // Aperçu du prix client, débounce ~350 ms. Purement indicatif : un échec
  // masque simplement l'encart.
  useEffect(() => {
    const net = Number(netPrice);
    if (!Number.isFinite(net) || net <= 0) {
      setSalePreview(null);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(() => {
      previewSalePrice(net).then(({ salePrice }) => {
        if (!cancelled) setSalePreview(salePrice);
      });
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [netPrice]);

  const handleSubmit = useCallback(async () => {
    if (isSaving) return;

    setError(null);
    setIsSaving(true);

    const values: ProductFormValues = {
      name,
      description: description || null,
      netPrice: Number(netPrice),
      unit: showUnit ? unit : null,
      stockQuantity: showStock && stockQuantity ? Number(stockQuantity) : null,
      isAvailable,
      imageUrl,
      categoryId: categoryId || null,
    };

    try {
      const result = isEdit
        ? await updateVendorProduct(product.id, values)
        : await createVendorProduct(values);

      if (!result.success) {
        setError(result.error ?? "L'enregistrement a échoué");
        return;
      }

      toast({
        title: isEdit ? 'Produit modifié' : 'Produit créé',
        description: name,
      });
      router.push(VENDOR_ROUTES.produits);
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  }, [
    isSaving,
    name,
    description,
    netPrice,
    showUnit,
    unit,
    showStock,
    stockQuantity,
    isAvailable,
    imageUrl,
    product,
    categoryId,
    isEdit,
    router,
    toast,
  ]);

  return (
    <div className="space-y-4">
      <Link
        href={VENDOR_ROUTES.produits}
        className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-ink-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Retour au catalogue
      </Link>

      <div className="grid max-w-[920px] items-start gap-5 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-5">
          <Card title="Photo du produit">
            <VendorImagePicker
              value={imageUrl}
              onChange={setImageUrl}
              target="product"
              placeholder="Ajoutez une photo du produit"
              disabled={isSaving}
            />
          </Card>

          <Card title="Informations">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[13px] font-semibold">
                  Nom du produit *
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Thiéboudienne"
                  className="h-[50px] rounded-xl"
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-[13px] font-semibold">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Décrivez votre produit…"
                  rows={3}
                  className="rounded-xl"
                  disabled={isSaving}
                />
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card title="Tarification">
            <div className="space-y-2">
              <Label htmlFor="netPrice" className="text-[13px] font-semibold">
                Prix que vous touchez *
              </Label>
              <div className="relative">
                <Input
                  id="netPrice"
                  type="text"
                  inputMode="numeric"
                  value={netPrice}
                  onChange={(e) => setNetPrice(e.target.value.replace(/\D/g, ''))}
                  placeholder="0"
                  className="h-[58px] rounded-xl pr-16 text-[22px] font-bold"
                  disabled={isSaving}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[14px] font-semibold text-ink-muted">
                  F CFA
                </span>
              </div>
            </div>

            {salePreview !== null && (
              <div className="mt-3.5 flex gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
                <Lightbulb
                  className="h-5 w-5 shrink-0 text-green-forest"
                  aria-hidden="true"
                />
                <div className="text-[13.5px] leading-relaxed text-green-deep">
                  Prix de vente affiché au client :{' '}
                  <b>{formatStatsAmount(salePreview)}</b>
                  <p className="mt-0.5 text-[12px] text-ink-muted">
                    Calculé automatiquement — aucune commission à gérer.
                  </p>
                </div>
              </div>
            )}
          </Card>

          <Card title={showStock ? 'Stock & disponibilité' : 'Disponibilité'}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="isAvailable" className="text-[15px] font-semibold">
                  Disponible à la vente
                </Label>
                <Switch
                  id="isAvailable"
                  checked={isAvailable}
                  onCheckedChange={setIsAvailable}
                  disabled={isSaving}
                />
              </div>

              {showStock && (
                <div className="space-y-2 border-t border-neutral-300 pt-4">
                  <Label htmlFor="stock" className="text-[13px] font-semibold">
                    Quantité en stock
                  </Label>
                  <Input
                    id="stock"
                    type="text"
                    inputMode="numeric"
                    value={stockQuantity}
                    onChange={(e) =>
                      setStockQuantity(e.target.value.replace(/\D/g, ''))
                    }
                    placeholder="Illimité"
                    className="h-[50px] rounded-xl"
                    disabled={isSaving}
                  />
                </div>
              )}

              {showUnit && (
                <div className="space-y-2 border-t border-neutral-300 pt-4">
                  <Label className="text-[13px] font-semibold">Unité de vente</Label>
                  <Select value={unit} onValueChange={setUnit} disabled={isSaving}>
                    <SelectTrigger className="h-[50px] rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCT_UNITS.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2 border-t border-neutral-300 pt-4">
                <Label className="text-[13px] font-semibold">Catégorie *</Label>
                <Select
                  value={categoryId}
                  onValueChange={setCategoryId}
                  disabled={isSaving || categories.length === 0}
                >
                  <SelectTrigger className="h-[50px] rounded-xl">
                    <SelectValue
                      placeholder={
                        categories.length === 0
                          ? 'Aucune catégorie disponible'
                          : 'Sélectionnez une catégorie'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {error && (
            <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              asChild
              className="h-[50px] flex-1 rounded-xl"
              disabled={isSaving}
            >
              <Link href={VENDOR_ROUTES.produits}>Annuler</Link>
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSaving}
              className="h-[50px] flex-[1.4] rounded-xl font-bold"
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
          </div>
        </div>
      </div>
    </div>
  );
}
