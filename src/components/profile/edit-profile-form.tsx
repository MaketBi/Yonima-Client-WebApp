'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft,
  Camera,
  Loader2,
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { updateUserProfile, uploadAvatar, deleteAccount } from '@/actions/user';
import { getInitials, formatPhone } from '@/lib/utils';
import type { User } from '@/types/models';

interface EditProfileFormProps {
  user: User;
}

export function EditProfileForm({ user }: EditProfileFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState(user.full_name || '');
  const [email, setEmail] = useState(user.email || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url || '');

  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner une image',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Erreur',
        description: "L'image ne doit pas dépasser 5 Mo",
        variant: 'destructive',
      });
      return;
    }

    setIsUploadingAvatar(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const result = await uploadAvatar(formData);

      if (result.success && result.url) {
        setAvatarUrl(result.url);
        toast({
          title: 'Photo mise à jour',
          description: 'Votre photo de profil a été modifiée',
        });
      } else {
        toast({
          title: 'Erreur',
          description: result.error || "Impossible de télécharger l'image",
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: "Une erreur est survenue",
        variant: 'destructive',
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      toast({
        title: 'Erreur',
        description: 'Le nom est requis',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    try {
      const result = await updateUserProfile({
        full_name: fullName.trim(),
        email: email.trim() || undefined,
      });

      if (result.success) {
        toast({
          title: 'Profil mis à jour',
          description: 'Vos informations ont été enregistrées',
        });
        router.push('/profil');
        router.refresh();
      } else {
        toast({
          title: 'Erreur',
          description: result.error || 'Impossible de sauvegarder',
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
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);

    try {
      const result = await deleteAccount();

      if (result.success) {
        toast({
          title: 'Compte supprimé',
          description: 'Votre compte a été supprimé avec succès',
        });
        router.push('/');
        router.refresh();
      } else {
        toast({
          title: 'Erreur',
          description: result.error || 'Impossible de supprimer le compte',
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
      setShowDeleteDialog(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b">
        <div className="container flex items-center justify-between h-14">
          <Button variant="ghost" size="icon" className="rounded-full" asChild>
            <Link href="/profil">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="font-semibold text-lg">Modifier le profil</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Enregistrer'
            )}
          </Button>
        </div>
      </div>

      <div className="container py-6 space-y-6 max-w-2xl">
        {/* Avatar Section */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatarUrl || undefined} alt={fullName} />
              <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                {getInitials(fullName || user.full_name)}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={handleAvatarClick}
              disabled={isUploadingAvatar}
              className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isUploadingAvatar ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
          <p className="text-sm text-muted-foreground mt-2">
            Appuyez pour changer la photo
          </p>
        </div>

        {/* Profile Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informations personnelles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">
                <UserIcon className="h-4 w-4 inline mr-2" />
                Nom complet
              </Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Votre nom"
              />
            </div>

            {/* Phone (read-only) */}
            <div className="space-y-2">
              <Label htmlFor="phone">
                <Phone className="h-4 w-4 inline mr-2" />
                Téléphone
              </Label>
              <Input
                id="phone"
                value={formatPhone(user.phone)}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Le numéro de téléphone ne peut pas être modifié
              </p>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">
                <Mail className="h-4 w-4 inline mr-2" />
                Email (optionnel)
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Addresses Link */}
        <Link href="/profil/adresses">
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Mes adresses</p>
                <p className="text-sm text-muted-foreground">
                  Gérer mes adresses de livraison
                </p>
              </div>
              <ChevronLeft className="h-5 w-5 text-muted-foreground rotate-180" />
            </CardContent>
          </Card>
        </Link>

        {/* Delete Account */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-base text-destructive">Zone de danger</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer mon compte
            </Button>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Cette action est irréversible
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Supprimer le compte ?
            </DialogTitle>
            <DialogDescription>
              Cette action est irréversible. Toutes vos données seront supprimées
              et vous ne pourrez plus accéder à votre compte.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Suppression...
                </>
              ) : (
                'Supprimer définitivement'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
