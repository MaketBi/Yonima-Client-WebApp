'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { OTP_LENGTH } from '@/lib/constants';

interface VendorOtpInputProps {
  value: string;
  onChange: (code: string) => void;
  /** Appelé dès que la dernière case est remplie (auto-vérification, comme iOS). */
  onComplete: (code: string) => void;
  disabled?: boolean;
  hasError?: boolean;
}

/**
 * Saisie OTP en cases séparées (design vendeur).
 * Case active : bordure verte 2px · remplie : chiffre gras · vide : tiret gris.
 */
export function VendorOtpInput({
  value,
  onChange,
  onComplete,
  disabled = false,
  hasError = false,
}: VendorOtpInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  // Évite de relancer la vérification si l'utilisateur corrige puis recomplète.
  const completedRef = useRef<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (value.length === OTP_LENGTH && completedRef.current !== value) {
      completedRef.current = value;
      onComplete(value);
    }
    if (value.length < OTP_LENGTH) {
      completedRef.current = null;
    }
  }, [value, onComplete]);

  const handleChange = useCallback(
    (raw: string) => {
      onChange(raw.replace(/\D/g, '').slice(0, OTP_LENGTH));
    },
    [onChange]
  );

  const cells = Array.from({ length: OTP_LENGTH });

  return (
    <div
      className="relative"
      onClick={() => inputRef.current?.focus()}
      role="presentation"
    >
      {/* Champ réel : invisible mais superposé, pour garder clavier natif + autofill OTP. */}
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={OTP_LENGTH}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        disabled={disabled}
        autoComplete="one-time-code"
        aria-label="Code de vérification"
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      />

      <div className="flex gap-3" aria-hidden="true">
        {cells.map((_, index) => {
          const char = value[index];
          const isActive = isFocused && index === Math.min(value.length, OTP_LENGTH - 1);

          return (
            <div
              key={index}
              className={cn(
                'flex h-[60px] flex-1 items-center justify-center rounded-xl text-2xl font-bold transition-colors',
                'border-[1.5px] border-neutral-200 bg-white',
                char && 'border-neutral-300 text-ink',
                isActive && 'border-2 border-green-forest',
                hasError && 'border-2 border-destructive'
              )}
            >
              {char ?? <span className="text-neutral-500">–</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
