'use client';

import { useCallback, useRef, useState } from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { compressImage, validateImageFile } from '@/lib/vendor/image';
import { uploadVendorImage, type UploadTarget } from '@/actions/vendor-upload';

interface VendorImagePickerProps {
  value: string | null;
  onChange: (url: string | null) => void;
  target: UploadTarget;
  /** Hauteur de la zone ; 180px pour un produit, 120px pour une catégorie. */
  height?: number;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * Sélecteur d'image : compresse côté navigateur puis téléverse.
 * L'URL publique remonte via `onChange` ; c'est le formulaire appelant qui
 * l'enregistre avec ses autres champs.
 */
export function VendorImagePicker({
  value,
  onChange,
  target,
  height = 180,
  placeholder = 'Ajoutez une photo',
  disabled = false,
}: VendorImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      const invalid = validateImageFile(file);
      if (invalid) {
        setError(invalid);
        return;
      }

      setError(null);
      setIsUploading(true);

      try {
        const { file: compressed } = await compressImage(file);

        const formData = new FormData();
        formData.append('file', compressed);
        formData.append('target', target);
        if (value) formData.append('previousUrl', value);

        const result = await uploadVendorImage(formData);

        if (!result.success || !result.url) {
          setError(result.error ?? "Le téléversement a échoué");
          return;
        }
        onChange(result.url);
      } finally {
        setIsUploading(false);
        // Permet de re-sélectionner le même fichier après une erreur.
        if (inputRef.current) inputRef.current.value = '';
      }
    },
    [onChange, target, value]
  );

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        disabled={disabled || isUploading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      <div
        className={cn(
          'relative overflow-hidden rounded-[14px] border-[1.5px] border-dashed border-neutral-200',
          value && 'border-solid'
        )}
        style={{ height }}
      >
        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="" className="h-full w-full object-cover" />
            {!disabled && (
              <button
                type="button"
                onClick={() => onChange(null)}
                disabled={isUploading}
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-white transition-colors hover:bg-black/75"
                aria-label="Retirer l'image"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={disabled || isUploading}
            className="flex h-full w-full flex-col items-center justify-center gap-2 text-ink-muted transition-colors hover:bg-neutral-100/60 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <Loader2 className="h-6 w-6 animate-spin text-green-forest" />
            ) : (
              <ImagePlus className="h-6 w-6" aria-hidden="true" />
            )}
            <span className="text-[13.5px]">
              {isUploading ? 'Téléversement…' : placeholder}
            </span>
          </button>
        )}

        {value && isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <Loader2 className="h-6 w-6 animate-spin text-green-forest" />
          </div>
        )}
      </div>

      {value && !disabled && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="text-[13px] font-semibold text-green-forest transition-colors hover:text-green-deep disabled:opacity-50"
        >
          Changer l&apos;image
        </button>
      )}

      {error && <p className="text-[13px] text-destructive">{error}</p>}
    </div>
  );
}
