'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  MapPin,
  Plus,
  Star,
  Trash2,
  Edit2,
  Loader2,
  Home,
  Briefcase,
  MoreVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { deleteAddress, updateAddress } from '@/actions/addresses';
import { AddressPickerScreen } from '@/components/checkout/address-picker-screen';
import type { DeliveryAddress } from '@/types/models';

interface AddressesManagerProps {
  initialAddresses: DeliveryAddress[];
}

const labelIcons: Record<string, typeof Home> = {
  Maison: Home,
  Bureau: Briefcase,
};

export function AddressesManager({ initialAddresses }: AddressesManagerProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [addresses, setAddresses] = useState(initialAddresses);
  const [isAddressPickerOpen, setIsAddressPickerOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<DeliveryAddress | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<DeliveryAddress | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSettingDefault, setIsSettingDefault] = useState<string | null>(null);

  const handleSetDefault = async (address: DeliveryAddress) => {
    if (address.is_default) return;

    setIsSettingDefault(address.id);

    try {
      const result = await updateAddress(address.id, { is_default: true });

      if (result.success) {
        // Update local state
        setAddresses((prev) =>
          prev.map((a) => ({
            ...a,
            is_default: a.id === address.id,
          }))
        );
        toast({
          title: 'Adresse par défaut',
          description: 'Cette adresse est maintenant votre adresse par défaut',
        });
      } else {
        toast({
          title: 'Erreur',
          description: result.error || "Impossible de définir l'adresse par défaut",
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue',
        variant: 'destructive',
      });
    } finally {
      setIsSettingDefault(null);
    }
  };

  const handleDelete = async () => {
    if (!addressToDelete) return;

    setIsDeleting(true);

    try {
      const result = await deleteAddress(addressToDelete.id);

      if (result.success) {
        setAddresses((prev) => prev.filter((a) => a.id !== addressToDelete.id));
        toast({
          title: 'Adresse supprimée',
          description: "L'adresse a été supprimée avec succès",
        });
      } else {
        toast({
          title: 'Erreur',
          description: result.error || "Impossible de supprimer l'adresse",
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setAddressToDelete(null);
    }
  };

  const handleAddressPickerClose = () => {
    setIsAddressPickerOpen(false);
    setEditingAddress(null);
    // Refresh addresses
    router.refresh();
  };

  const getLabelIcon = (label: string | null) => {
    if (!label) return MapPin;
    return labelIcons[label] || MapPin;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b">
        <div className="container flex items-center justify-between h-14">
          <Button variant="ghost" size="icon" className="rounded-full" asChild>
            <Link href="/profil/modifier">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="font-semibold text-lg">Mes adresses</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="container py-6 space-y-4 max-w-2xl">
        {/* Add Address Button */}
        <Button
          variant="outline"
          className="w-full h-14 border-dashed border-2"
          onClick={() => setIsAddressPickerOpen(true)}
        >
          <Plus className="h-5 w-5 mr-2" />
          Ajouter une adresse
        </Button>

        {/* Addresses List */}
        {addresses.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Aucune adresse enregistrée</h3>
              <p className="text-sm text-muted-foreground">
                Ajoutez une adresse de livraison pour passer vos commandes plus rapidement
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {addresses.map((address) => {
              const Icon = getLabelIcon(address.label);
              return (
                <Card
                  key={address.id}
                  className={address.is_default ? 'border-primary' : ''}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          address.is_default ? 'bg-primary/10' : 'bg-muted'
                        }`}
                      >
                        <Icon
                          className={`h-5 w-5 ${
                            address.is_default ? 'text-primary' : 'text-muted-foreground'
                          }`}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {address.label || 'Adresse'}
                          </span>
                          {address.is_default && (
                            <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                              <Star className="h-3 w-3 fill-current" />
                              Par défaut
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {address.address}
                        </p>
                        {address.additional_info && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {address.additional_info}
                          </p>
                        )}
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {!address.is_default && (
                            <DropdownMenuItem
                              onClick={() => handleSetDefault(address)}
                              disabled={isSettingDefault === address.id}
                            >
                              {isSettingDefault === address.id ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <Star className="h-4 w-4 mr-2" />
                              )}
                              Définir par défaut
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingAddress(address);
                              setIsAddressPickerOpen(true);
                            }}
                          >
                            <Edit2 className="h-4 w-4 mr-2" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => {
                              setAddressToDelete(address);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Address Picker Dialog */}
      <AddressPickerScreen
        open={isAddressPickerOpen}
        onOpenChange={handleAddressPickerClose}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer cette adresse ?</DialogTitle>
            <DialogDescription>
              {addressToDelete?.address}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Suppression...
                </>
              ) : (
                'Supprimer'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
