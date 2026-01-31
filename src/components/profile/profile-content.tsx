'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Phone,
  Mail,
  LogOut,
  ChevronRight,
  ShoppingBag,
  Heart,
  Bell,
  HelpCircle,
  FileText,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { signOut } from '@/actions/auth';
import { useUserStore } from '@/stores/user-store';
import { getInitials, formatPhone } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';
import type { User as UserType } from '@/types/models';

interface ProfileContentProps {
  user: UserType;
}

const menuItems = [
  {
    href: ROUTES.commandes,
    icon: ShoppingBag,
    label: 'Mes commandes',
    description: 'Historique et suivi',
  },
  {
    href: ROUTES.fidelite,
    icon: Heart,
    label: 'Ma fidélité',
    description: 'Points et récompenses',
  },
  {
    href: ROUTES.notifications,
    icon: Bell,
    label: 'Notifications',
    description: 'Gérer les alertes',
  },
];

const supportItems = [
  {
    href: '/aide',
    icon: HelpCircle,
    label: 'Aide & Support',
  },
  {
    href: '/conditions',
    icon: FileText,
    label: "Conditions d'utilisation",
  },
];

export function ProfileContent({ user }: ProfileContentProps) {
  const router = useRouter();
  const clearUserStore = useUserStore((state) => state.clear);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      clearUserStore();
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
      setShowLogoutDialog(false);
    }
  };

  return (
    <div className="container py-6 space-y-6 max-w-2xl">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatar_url || undefined} alt={user.full_name || 'Avatar'} />
              <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                {getInitials(user.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-xl font-semibold">
                {user.full_name || 'Utilisateur'}
              </h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <Phone className="h-4 w-4" />
                <span>{formatPhone(user.phone)}</span>
              </div>
              {user.email && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <Mail className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Edit Profile Button */}
          <Button variant="outline" className="w-full mt-4" asChild>
            <Link href="/profil/modifier">
              <User className="h-4 w-4 mr-2" />
              Modifier le profil
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Menu Items */}
      <Card>
        <CardContent className="p-0">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-4 p-4 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Link>
                {index < menuItems.length - 1 && <Separator />}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Support Items */}
      <Card>
        <CardContent className="p-0">
          {supportItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-4 p-4 hover:bg-muted transition-colors"
                >
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <span className="flex-1">{item.label}</span>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Link>
                {index < supportItems.length - 1 && <Separator />}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Logout Button */}
      <Button
        variant="outline"
        className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={() => setShowLogoutDialog(true)}
      >
        <LogOut className="h-4 w-4 mr-2" />
        Se déconnecter
      </Button>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Se déconnecter ?</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir vous déconnecter de votre compte ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowLogoutDialog(false)}
              disabled={isLoggingOut}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Déconnexion...
                </>
              ) : (
                'Se déconnecter'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
