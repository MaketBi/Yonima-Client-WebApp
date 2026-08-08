'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, MoreHorizontal, Plus, Trash2, UserPlus, Users } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { PermissionsEditor } from './permissions-editor';
import {
  createVendorAssistant,
  deleteVendorAssistant,
  toggleAssistantActive,
  updateAssistantPermissions,
} from '@/actions/vendor-assistants';
import { formatVendorPhone, initialsOf } from '@/lib/vendor/format';
import {
  DEFAULT_ASSISTANT_PERMISSIONS,
  permissionSummary,
  type AssistantPermissions,
  type VendorAssistant,
} from '@/types/vendor';

interface AssistantsViewProps {
  assistants: VendorAssistant[];
  canManage: boolean;
  loadError?: string;
}

export function AssistantsView({
  assistants,
  canManage,
  loadError,
}: AssistantsViewProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<VendorAssistant | null>(null);
  const [pendingDelete, setPendingDelete] = useState<VendorAssistant | null>(null);
  const [isPending, startTransition] = useTransition();

  // Formulaire de création.
  const [name, setName] = useState('');
  const [phoneDigits, setPhoneDigits] = useState('');
  const [permissions, setPermissions] = useState<AssistantPermissions>(
    DEFAULT_ASSISTANT_PERMISSIONS
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Permissions en cours d'édition.
  const [editedPermissions, setEditedPermissions] =
    useState<AssistantPermissions | null>(null);

  const openCreate = () => {
    setName('');
    setPhoneDigits('');
    setPermissions(DEFAULT_ASSISTANT_PERMISSIONS);
    setError(null);
    setShowCreate(true);
  };

  const handleCreate = async () => {
    if (isSaving) return;

    setIsSaving(true);
    setError(null);

    try {
      const result = await createVendorAssistant({
        name,
        phone: phoneDigits,
        permissions,
      });

      if (!result.success) {
        setError(result.error ?? 'La création a échoué');
        return;
      }
      toast({ title: 'Assistant créé', description: name.trim() });
      setShowCreate(false);
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePermissions = async () => {
    if (!editing || !editedPermissions || isSaving) return;

    setIsSaving(true);
    try {
      const result = await updateAssistantPermissions(
        editing.id,
        editedPermissions
      );
      if (!result.success) {
        toast({
          title: 'La mise à jour a échoué',
          description: result.error,
          variant: 'destructive',
        });
        return;
      }
      toast({ title: 'Permissions mises à jour' });
      setEditing(null);
      setEditedPermissions(null);
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = (assistant: VendorAssistant) => {
    const next = assistant.is_active === false;

    startTransition(async () => {
      const result = await toggleAssistantActive(assistant.id, next);
      if (!result.success) {
        toast({
          title: 'La mise à jour a échoué',
          description: result.error,
          variant: 'destructive',
        });
        return;
      }
      toast({ title: next ? 'Assistant activé' : 'Assistant désactivé' });
      router.refresh();
    });
  };

  const handleDelete = () => {
    if (!pendingDelete) return;

    startTransition(async () => {
      const result = await deleteVendorAssistant(pendingDelete.id);
      if (!result.success) {
        toast({
          title: 'La suppression a échoué',
          description: result.error,
          variant: 'destructive',
        });
        return;
      }
      toast({ title: 'Assistant supprimé' });
      setPendingDelete(null);
      router.refresh();
    });
  };

  const isPhoneComplete = phoneDigits.length === 9;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13.5px] text-ink-muted">
          Gérez l&apos;accès à votre établissement.
        </p>
        {canManage && (
          <Button onClick={openCreate} className="h-11 rounded-xl">
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un assistant
          </Button>
        )}
      </div>

      {loadError && (
        <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {loadError}
        </p>
      )}

      {assistants.length === 0 ? (
        <div className="flex flex-col items-center rounded-[18px] bg-white px-6 py-16 text-center shadow-card">
          <Users className="h-10 w-10 text-neutral-500" aria-hidden="true" />
          <h2 className="mt-4 text-[17px] font-bold">Aucun assistant</h2>
          <p className="mt-1 text-[14px] text-ink-muted">
            Ajoutez des assistants pour leur permettre de gérer votre établissement.
          </p>
          {canManage && (
            <Button onClick={openCreate} className="mt-5 rounded-xl">
              <UserPlus className="mr-2 h-4 w-4" />
              Ajouter un assistant
            </Button>
          )}
        </div>
      ) : (
        <ul className="grid gap-3 xl:grid-cols-2">
          {assistants.map((assistant) => {
            const inactive = assistant.is_active === false;
            const chips = permissionSummary(assistant.permissions);

            return (
              <li
                key={assistant.id}
                className={cn(
                  'rounded-2xl border border-neutral-300 bg-white p-4',
                  inactive && 'opacity-60'
                )}
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-[14px] font-bold">
                    {initialsOf(assistant.user?.full_name)}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-[15px] font-bold">
                        {assistant.user?.full_name || 'Assistant'}
                      </h3>
                      {inactive && (
                        <span className="shrink-0 rounded-pill bg-neutral-100 px-2 py-0.5 text-[11px] font-bold text-ink-muted">
                          Inactif
                        </span>
                      )}
                    </div>
                    <p className="text-[12.5px] text-ink-muted">
                      {formatVendorPhone(assistant.user?.phone ?? null)}
                    </p>
                  </div>

                  {canManage && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="rounded-lg p-1 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-ink"
                          aria-label={`Actions pour ${assistant.user?.full_name ?? 'cet assistant'}`}
                          disabled={isPending}
                        >
                          <MoreHorizontal className="h-5 w-5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onSelect={() => {
                            setEditing(assistant);
                            setEditedPermissions(assistant.permissions);
                          }}
                        >
                          Modifier les permissions
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleToggle(assistant)}>
                          {inactive ? 'Activer' : 'Désactiver'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => setPendingDelete(assistant)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                {chips.length > 0 && (
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {chips.map((chip) => (
                      <li
                        key={chip}
                        className="rounded-pill bg-green-50 px-2.5 py-1 text-[11.5px] font-semibold text-green-deep"
                      >
                        {chip}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* Création */}
      <Dialog open={showCreate} onOpenChange={(o) => !isSaving && setShowCreate(o)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nouvel assistant</DialogTitle>
            <DialogDescription>
              Configurez les accès de votre assistant selon ses responsabilités.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="assistantName" className="text-[13px] font-semibold">
                Nom complet *
              </Label>
              <Input
                id="assistantName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Fatou Diop"
                className="h-[50px] rounded-xl"
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assistantPhone" className="text-[13px] font-semibold">
                Numéro de téléphone *
              </Label>
              <div className="flex gap-2">
                <span className="flex h-[50px] items-center rounded-xl bg-neutral-100 px-4 text-[15px] font-semibold">
                  🇸🇳 +221
                </span>
                <Input
                  id="assistantPhone"
                  type="tel"
                  inputMode="numeric"
                  value={phoneDigits}
                  onChange={(e) =>
                    setPhoneDigits(e.target.value.replace(/\D/g, '').slice(0, 9))
                  }
                  placeholder="77 123 45 67"
                  className="h-[50px] flex-1 rounded-xl"
                  disabled={isSaving}
                />
              </div>
              {phoneDigits.length > 0 && !isPhoneComplete && (
                <p className="text-[12px] text-warning-ink">Numéro trop court</p>
              )}
            </div>

            <div className="border-t border-neutral-300 pt-4">
              <PermissionsEditor
                value={permissions}
                onChange={setPermissions}
                disabled={isSaving}
                idPrefix="create"
              />
            </div>

            <p className="rounded-xl bg-green-50 px-3.5 py-3 text-[12.5px] leading-relaxed text-green-deep">
              L&apos;assistant pourra se connecter avec ce numéro via un code OTP
              envoyé par WhatsApp.
            </p>

            {error && (
              <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setShowCreate(false)}
              disabled={isSaving}
              className="sm:flex-1"
            >
              Annuler
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!name.trim() || !isPhoneComplete || isSaving}
              className="sm:flex-1"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création…
                </>
              ) : (
                'Créer'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Édition des permissions */}
      <Dialog
        open={!!editing}
        onOpenChange={(o) => {
          if (!isSaving && !o) {
            setEditing(null);
            setEditedPermissions(null);
          }
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing?.user?.full_name || 'Assistant'}
            </DialogTitle>
            <DialogDescription>
              Ajustez les accès de cet assistant.
            </DialogDescription>
          </DialogHeader>

          {editedPermissions && (
            <div className="py-2">
              <PermissionsEditor
                value={editedPermissions}
                onChange={setEditedPermissions}
                disabled={isSaving}
                idPrefix="edit"
              />
            </div>
          )}

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => {
                setEditing(null);
                setEditedPermissions(null);
              }}
              disabled={isSaving}
              className="sm:flex-1"
            >
              Annuler
            </Button>
            <Button
              onClick={handleSavePermissions}
              disabled={isSaving}
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

      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l&apos;assistant</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L&apos;assistant ne pourra plus se
              connecter et son numéro de téléphone sera libéré.
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
              Supprimer définitivement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
