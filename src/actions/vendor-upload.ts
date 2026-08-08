'use server';

import { createServerClient } from '@/lib/supabase/server';
import { getVendorSession } from '@/actions/vendor-auth';

/** Cible d'upload → bucket + dossier, calqués sur l'app iOS. */
const TARGETS = {
  product: { bucket: 'product-images', folder: '' },
  category: { bucket: 'vendor-assets', folder: 'categories' },
  logo: { bucket: 'vendor-assets', folder: 'logos' },
} as const;

export type UploadTarget = keyof typeof TARGETS;

const MAX_BYTES = 5 * 1024 * 1024;

/**
 * Extrait le chemin de stockage depuis une URL publique.
 * Renvoie `null` si le bucket n'apparaît pas dans l'URL — on ne supprime alors
 * rien plutôt que de risquer d'effacer un fichier étranger.
 */
function extractStoragePath(url: string, bucket: string): string | null {
  try {
    const segments = new URL(url).pathname.split('/');
    const index = segments.indexOf(bucket);
    if (index === -1 || index === segments.length - 1) return null;
    return segments.slice(index + 1).join('/');
  } catch {
    return null;
  }
}

/**
 * Envoie une image dans Supabase Storage et renvoie son URL publique.
 *
 * L'image est déjà compressée côté navigateur (`src/lib/vendor/image.ts`) ;
 * la validation ci-dessous est le garde-fou serveur.
 *
 * Ne met à jour aucune table : l'URL retournée est enregistrée par le
 * formulaire appelant, avec le reste de ses champs.
 */
export async function uploadVendorImage(
  formData: FormData
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const session = await getVendorSession();
    if (!session.ok) {
      return { success: false, error: 'Session vendeur introuvable' };
    }

    const target = (formData.get('target') as UploadTarget) || 'product';
    const config = TARGETS[target];
    if (!config) {
      return { success: false, error: 'Cible de téléversement inconnue' };
    }

    const file = formData.get('file') as File | null;
    if (!file) return { success: false, error: 'Aucun fichier fourni' };

    if (!file.type.startsWith('image/')) {
      return { success: false, error: 'Le fichier doit être une image' };
    }
    if (file.size > MAX_BYTES) {
      return { success: false, error: "L'image ne doit pas dépasser 5 Mo" };
    }

    const supabase = await createServerClient();
    const vendorId = session.session.vendor.id;

    // Chemin toujours préfixé par le vendorId : la RLS Storage s'appuie dessus.
    const fileName = `${crypto.randomUUID()}.jpg`;
    const path = config.folder
      ? `${config.folder}/${vendorId}/${fileName}`
      : `${vendorId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(config.bucket)
      .upload(path, file, { contentType: file.type, upsert: true });

    if (uploadError) {
      console.error('[vendor-upload] upload:', uploadError.message);
      return { success: false, error: "Le téléversement de l'image a échoué" };
    }

    // Suppression de l'ancienne image APRÈS l'upload : si la nouvelle échoue,
    // le vendeur garde la précédente. Échec ignoré (fichier déjà absent, etc.).
    const previousUrl = formData.get('previousUrl') as string | null;
    if (previousUrl) {
      const previousPath = extractStoragePath(previousUrl, config.bucket);
      if (previousPath && previousPath !== path) {
        await supabase.storage.from(config.bucket).remove([previousPath]);
      }
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(config.bucket).getPublicUrl(path);

    return { success: true, url: publicUrl };
  } catch (error) {
    console.error('[vendor-upload] unexpected:', error);
    return { success: false, error: "Le téléversement de l'image a échoué" };
  }
}
