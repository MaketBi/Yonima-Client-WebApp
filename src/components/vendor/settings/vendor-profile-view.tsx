'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Banknote,
  Bike,
  ChevronRight,
  Clock,
  ExternalLink,
  Loader2,
  LogOut,
  MessageCircle,
  Package,
  Star,
  Store,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';
import { useUserStore } from '@/stores/user-store';
import { VendorImagePicker } from '@/components/vendor/vendor-image-picker';
import { updateVendorProfile } from '@/actions/vendor-settings';
import { isVendorCurrentlyOpen } from '@/types/vendor';
import { ROUTES } from '@/lib/constants';
import {
  VENDOR_LEGAL_URLS,
  VENDOR_ROUTES,
  VENDOR_SUPPORT_PHONE,
  VENDOR_SUPPORT_WHATSAPP_MESSAGE,
} from '@/lib/vendor/constants';
import type { Vendor } from '@/types/models';

interface VendorProfileViewProps {
  vendor: Vendor;
  isOwner: boolean;
  usesOwnDrivers: boolean;
}

export function VendorProfileView({
  vendor,
  isOwner,
  usesOwnDrivers,
}: VendorProfileViewProps) {
  const router = useRouter();
  const { toast } = useToast();
  const clearUser = useUserStore((state) => state.clear);

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(vendor.name);
  const [description, setDescription] = useState(vendor.description ?? '');
  const [email, setEmail] = useState(vendor.email ?? '');
  const [address, setAddress] = useState(vendor.address ?? '');
  const [city, setCity] = useState(vendor.city ?? '');
  const [neighborhood, setNeighborhood] = useState(vendor.neighborhood ?? '');
  const [logoUrl, setLogoUrl] = useState<string | null>(vendor.logo_url);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentlyOpen = isVendorCurrentlyOpen(vendor.is_open, vendor.opening_hours);

  const supportHref = `https://wa.me/${VENDOR_SUPPORT_PHONE.replace(
    /\D/g,
    ''
  )}?text=${encodeURIComponent(VENDOR_SUPPORT_WHATSAPP_MESSAGE)}`;

  const handleSave = useCallback(async () => {
    if (isSaving) return;

    setIsSaving(true);
    setError(null);

    try {
      const result = await updateVendorProfile({
        name,
        description: description || null,
        email: email || null,
        address: address || null,
        city: city || null,
        neighborhood: neighborhood || null,
        logoUrl,
      });

      if (!result.success) {
        setError(result.error ?? "L'enregistrement a échoué");
        return;
      }
      toast({ title: 'Profil mis à jour' });
      setIsEditing(false);
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  }, [
    isSaving,
    name,
    description,
    email,
    address,
    city,
    neighborhood,
    logoUrl,
    router,
    toast,
  ]);

  const handleSignOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    clearUser();
    router.push(VENDOR_ROUTES.connexion);
    router.refresh();
  }, [clearUser, router]);

  const boutiqueLinks = [
    { href: VENDOR_ROUTES.avis, label: 'Avis clients', icon: Star, color: '#F59E0B' },
    {
      href: VENDOR_ROUTES.horaires,
      label: "Horaires d'ouverture",
      icon: Clock,
      color: '#3B82F6',
    },
    { href: VENDOR_ROUTES.assistants, label: 'Assistants', icon: Users, color: '#2E6A3B' },
  ];

  const livraisonLinks = usesOwnDrivers
    ? [
        {
          href: VENDOR_ROUTES.parametresLivraison,
          label: 'Paramètres de livraison',
          icon: Package,
          color: '#2E6A3B',
        },
        { href: VENDOR_ROUTES.livreurs, label: 'Mes livreurs', icon: Bike, color: '#3B82F6' },
        {
          href: VENDOR_ROUTES.caisse,
          label: 'Caisse livreurs',
          icon: Banknote,
          color: '#F59E0B',
        },
      ]
    : [
        {
          href: VENDOR_ROUTES.parametresLivraison,
          label: 'Paramètres de livraison',
          icon: Package,
          color: '#2E6A3B',
        },
      ];

  if (isEditing) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <section className="space-y-4 rounded-2xl bg-white p-5 shadow-card">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-muted">
            Logo
          </h2>
          <VendorImagePicker
            value={logoUrl}
            onChange={setLogoUrl}
            target="logo"
            height={140}
            placeholder="Ajoutez votre logo"
            disabled={isSaving}
          />
        </section>

        <section className="space-y-4 rounded-2xl bg-white p-5 shadow-card">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-muted">
            Informations
          </h2>

          <div className="space-y-2">
            <Label htmlFor="vendorName" className="text-[13px] font-semibold">
              Nom de l&apos;établissement *
            </Label>
            <Input
              id="vendorName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-[50px] rounded-xl"
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vendorDesc" className="text-[13px] font-semibold">
              Description
            </Label>
            <Textarea
              id="vendorDesc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="rounded-xl"
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[13px] font-semibold">Téléphone</Label>
            <Input
              value={vendor.phone ?? ''}
              readOnly
              disabled
              className="h-[50px] rounded-xl bg-neutral-100"
            />
            <p className="text-[12px] text-ink-muted">
              Le téléphone identifie votre compte et ne peut pas être modifié.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vendorEmail" className="text-[13px] font-semibold">
              Email
            </Label>
            <Input
              id="vendorEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-[50px] rounded-xl"
              disabled={isSaving}
            />
          </div>
        </section>

        <section className="space-y-4 rounded-2xl bg-white p-5 shadow-card">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-muted">
            Adresse
          </h2>

          <div className="space-y-2">
            <Label htmlFor="vendorAddress" className="text-[13px] font-semibold">
              Adresse
            </Label>
            <Input
              id="vendorAddress"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="h-[50px] rounded-xl"
              disabled={isSaving}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="vendorCity" className="text-[13px] font-semibold">
                Ville
              </Label>
              <Input
                id="vendorCity"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="h-[50px] rounded-xl"
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vendorHood" className="text-[13px] font-semibold">
                Quartier
              </Label>
              <Input
                id="vendorHood"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className="h-[50px] rounded-xl"
                disabled={isSaving}
              />
            </div>
          </div>
        </section>

        {error && (
          <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setIsEditing(false)}
            disabled={isSaving}
            className="h-12 flex-1 rounded-xl"
          >
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name.trim() || isSaving}
            className="h-12 flex-[1.4] rounded-xl"
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
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <section className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-card">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-green-forest text-[20px] font-bold text-white">
          {vendor.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={vendor.logo_url} alt="" className="h-full w-full object-cover" />
          ) : (
            vendor.name.slice(0, 2).toUpperCase()
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[18px] font-bold">{vendor.name}</h1>
          <p
            className={cn(
              'mt-1 flex items-center gap-1.5 text-[11.5px] font-bold uppercase tracking-[0.1em]',
              currentlyOpen ? 'text-green-deep' : 'text-ink-muted'
            )}
          >
            <span
              className={cn(
                'h-[7px] w-[7px] rounded-full',
                currentlyOpen ? 'bg-green-electric' : 'bg-neutral-500'
              )}
            />
            {currentlyOpen ? 'Ouvert' : 'Fermé'}
          </p>
        </div>

        {isOwner && (
          <Button variant="outline" onClick={() => setIsEditing(true)} className="rounded-xl">
            Modifier
          </Button>
        )}
      </section>

      <MenuSection title="Ma boutique" links={boutiqueLinks} />
      <MenuSection title="Livraison" links={livraisonLinks} />

      <section className="rounded-2xl bg-white p-2 shadow-card">
        <a
          href={supportHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-neutral-100"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#25D366]/15">
            <MessageCircle className="h-[18px] w-[18px] text-[#25D366]" aria-hidden="true" />
          </span>
          <span className="flex-1 text-[14.5px] font-medium">
            Contactez-nous sur WhatsApp
          </span>
          <ExternalLink className="h-4 w-4 text-neutral-500" aria-hidden="true" />
        </a>

        <Link
          href={ROUTES.home}
          className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-neutral-100"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-100">
            <Store className="h-[18px] w-[18px] text-green-forest" aria-hidden="true" />
          </span>
          <span className="flex-1 text-[14.5px] font-medium">Aller sur la boutique</span>
          <ChevronRight className="h-4 w-4 text-neutral-500" aria-hidden="true" />
        </Link>
      </section>

      <section className="rounded-2xl bg-white p-2 shadow-card">
        {[
          { href: VENDOR_LEGAL_URLS.privacy, label: 'Politique de confidentialité' },
          { href: VENDOR_LEGAL_URLS.terms, label: "Conditions d'utilisation" },
        ].map((item) => (
          <a
            key={item.href}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-[14.5px] transition-colors hover:bg-neutral-100"
          >
            <span className="flex-1">{item.label}</span>
            <ExternalLink className="h-4 w-4 text-neutral-500" aria-hidden="true" />
          </a>
        ))}
      </section>

      <Button
        variant="outline"
        onClick={handleSignOut}
        className="h-12 w-full rounded-xl border-destructive text-destructive hover:bg-destructive/5 hover:text-destructive"
      >
        <LogOut className="mr-2 h-4 w-4" />
        Se déconnecter
      </Button>
    </div>
  );
}

function MenuSection({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string; icon: typeof Star; color: string }[];
}) {
  if (links.length === 0) return null;

  return (
    <section className="rounded-2xl bg-white p-2 shadow-card">
      <h2 className="px-3 pb-1 pt-2 text-[11px] font-bold uppercase tracking-[0.16em] text-ink-muted">
        {title}
      </h2>
      {links.map((link) => {
        const Icon = link.icon;

        return (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-neutral-100"
          >
            <span
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${link.color}1A` }}
            >
              <Icon
                className="h-[18px] w-[18px]"
                style={{ color: link.color }}
                aria-hidden="true"
              />
            </span>
            <span className="flex-1 text-[14.5px] font-medium">{link.label}</span>
            <ChevronRight className="h-4 w-4 text-neutral-500" aria-hidden="true" />
          </Link>
        );
      })}
    </section>
  );
}
