/**
 * Compression d'image côté navigateur, avant envoi au serveur.
 *
 * Reproduit le comportement de l'app iOS (`ImageUploadService.swift`) :
 * redimensionnement au plus grand côté puis encodage JPEG. Sans ça, un vendeur
 * qui prend une photo au téléphone enverrait 4–8 Mo — inacceptable sur une
 * connexion mobile à Dakar.
 */

/** Plus grand côté, en pixels (identique à iOS). */
const MAX_DIMENSION = 800;

/** Qualité JPEG (identique à iOS). */
const DEFAULT_QUALITY = 0.7;

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export interface CompressResult {
  file: File;
  /** Taille d'origine, pour informer l'utilisateur si besoin. */
  originalBytes: number;
}

/** Charge un fichier en HTMLImageElement via object URL (libéré ensuite). */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Image illisible"));
    };
    image.src = url;
  });
}

/**
 * Redimensionne (si nécessaire) et ré-encode en JPEG.
 *
 * En cas d'échec du canvas — navigateur exotique, image corrompue, mémoire —
 * on renvoie le fichier d'origine plutôt que de bloquer l'utilisateur : la
 * validation de taille côté serveur reste le garde-fou.
 */
export async function compressImage(
  file: File,
  maxDimension: number = MAX_DIMENSION,
  quality: number = DEFAULT_QUALITY
): Promise<CompressResult> {
  const originalBytes = file.size;

  try {
    const image = await loadImage(file);

    const ratio = Math.min(
      1,
      maxDimension / Math.max(image.width, image.height)
    );
    const width = Math.round(image.width * ratio);
    const height = Math.round(image.height * ratio);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) return { file, originalBytes };

    context.drawImage(image, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality)
    );

    if (!blob) return { file, originalBytes };

    // Si la compression n'apporte rien (petite image déjà optimisée), on garde
    // l'original pour ne pas dégrader inutilement.
    if (blob.size >= originalBytes && ratio === 1) {
      return { file, originalBytes };
    }

    const compressed = new File([blob], "image.jpg", {
      type: "image/jpeg",
      lastModified: Date.now(),
    });

    return { file: compressed, originalBytes };
  } catch {
    return { file, originalBytes };
  }
}

/** Validation côté client, doublée côté serveur. */
export function validateImageFile(file: File): string | null {
  if (!file.type.startsWith("image/")) {
    return "Le fichier doit être une image";
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return "L'image ne doit pas dépasser 5 Mo";
  }
  return null;
}
