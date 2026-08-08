'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PhoneInput } from '@/components/auth/phone-input';
import { VendorOtpInput } from './vendor-otp-input';
import { VendorWordmark } from './vendor-wordmark';
import { requestVendorOtp, verifyVendorOtp } from '@/actions/vendor-auth';
import { createClient } from '@/lib/supabase/client';
import { canAttempt, recordAttempt, resetAttempts, getWaitTimeSeconds } from '@/lib/rate-limiter';
import type { CountryData, OTPChannel } from '@/types/auth';
import { OTP_LENGTH, ROUTES } from '@/lib/constants';
import {
  VENDOR_ROUTES,
  VENDOR_SUPPORT_PHONE,
  VENDOR_SUPPORT_WHATSAPP_MESSAGE,
  VENDOR_TAGLINE,
} from '@/lib/vendor/constants';

type Step = 'phone' | 'otp';

interface VendorLoginFormProps {
  countries: CountryData[];
  redirectTo?: string;
}

export function VendorLoginForm({ countries, redirectTo }: VendorLoginFormProps) {
  const router = useRouter();

  const [step, setStep] = useState<Step>('phone');
  const [phoneDisplay, setPhoneDisplay] = useState('');
  const [fullPhone, setFullPhone] = useState('');
  const [isPhoneComplete, setIsPhoneComplete] = useState(false);

  const [otpCode, setOtpCode] = useState('');
  const [channel, setChannel] = useState<OTPChannel>('whatsapp');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);

  const supportHref = `https://wa.me/${VENDOR_SUPPORT_PHONE.replace(
    /\D/g,
    ''
  )}?text=${encodeURIComponent(VENDOR_SUPPORT_WHATSAPP_MESSAGE)}`;

  const handlePhoneChange = useCallback(
    (display: string, full: string, complete: boolean) => {
      setPhoneDisplay(display);
      setFullPhone(full);
      setIsPhoneComplete(complete);
      setError(null);
    },
    []
  );

  const sendOtp = useCallback(async () => {
    const rateLimitKey = `vendor_otp_request:${fullPhone}`;
    if (!canAttempt(rateLimitKey, 'otp_request')) {
      const waitTime = getWaitTimeSeconds(rateLimitKey, 'otp_request');
      setError(`Trop de demandes. Réessayez dans ${waitTime} secondes.`);
      return false;
    }

    const result = await requestVendorOtp(fullPhone);
    recordAttempt(rateLimitKey);

    if (!result.success) {
      setError(result.error || 'Une erreur est survenue');
      return false;
    }

    setChannel(result.channel || 'whatsapp');
    return true;
  }, [fullPhone]);

  const handleSubmitPhone = useCallback(async () => {
    if (!isPhoneComplete || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      if (await sendOtp()) {
        setOtpCode('');
        setOtpError(null);
        setStep('otp');
      }
    } catch {
      setError('Erreur réseau. Vérifiez votre connexion.');
    } finally {
      setIsLoading(false);
    }
  }, [isPhoneComplete, isLoading, sendOtp]);

  const handleVerify = useCallback(
    async (code: string) => {
      if (isLoading) return;

      const rateLimitKey = `vendor_otp_verify:${fullPhone}`;
      if (!canAttempt(rateLimitKey, 'otp')) {
        const waitTime = getWaitTimeSeconds(rateLimitKey, 'otp');
        setOtpError(`Trop de tentatives. Réessayez dans ${waitTime} secondes.`);
        return;
      }

      setIsLoading(true);
      setOtpError(null);
      recordAttempt(rateLimitKey);

      try {
        const result = await verifyVendorOtp(fullPhone, code);

        if (!result.success || !result.accessToken) {
          setOtpError(result.error || 'Code incorrect');
          setOtpCode('');
          return;
        }

        resetAttempts(rateLimitKey);
        resetAttempts(`vendor_otp_request:${fullPhone}`);

        const supabase = createClient();
        await supabase.auth.setSession({
          access_token: result.accessToken,
          refresh_token: result.refreshToken || '',
        });

        // Le contrôle du rôle vendeur se fait dans le layout /vendeur :
        // il affiche l'écran adapté si le compte n'est pas éligible.
        router.push(redirectTo || VENDOR_ROUTES.commandes);
        router.refresh();
      } catch {
        setOtpError('Erreur réseau. Vérifiez votre connexion.');
      } finally {
        setIsLoading(false);
      }
    },
    [fullPhone, isLoading, redirectTo, router]
  );

  const handleResend = useCallback(async () => {
    setOtpError(null);
    setOtpCode('');
    setIsLoading(true);
    try {
      await sendOtp();
    } finally {
      setIsLoading(false);
    }
  }, [sendOtp]);

  return (
    <div className="w-full max-w-[420px] space-y-2">
      <div className="flex flex-col items-center text-center">
        <VendorWordmark className="mb-2 text-[40px]" />
        <h1 className="text-[26px] font-bold tracking-[-0.04em]">Espace Vendeur</h1>
        <p className="mb-8 text-base text-ink-muted">{VENDOR_TAGLINE}</p>
      </div>

      {step === 'phone' ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-[15px] font-semibold">
              Numéro de téléphone
            </Label>
            <PhoneInput
              countries={countries}
              value={phoneDisplay}
              onChange={handlePhoneChange}
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button
            onClick={handleSubmitPhone}
            disabled={!isPhoneComplete || isLoading}
            className="h-14 w-full rounded-xl text-base"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Envoi du code...
              </>
            ) : (
              'Se connecter'
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-5">
          <p className="text-center text-sm leading-relaxed text-ink-muted">
            Nous vous avons envoyé un code de confirmation par{' '}
            <span className="font-semibold text-ink">
              {channel === 'whatsapp' ? 'WhatsApp' : 'SMS'}
            </span>{' '}
            au {phoneDisplay}
          </p>

          <VendorOtpInput
            value={otpCode}
            onChange={setOtpCode}
            onComplete={handleVerify}
            disabled={isLoading}
            hasError={!!otpError}
          />

          {otpError && (
            <p className="text-center text-sm text-destructive">{otpError}</p>
          )}

          <Button
            onClick={() => handleVerify(otpCode)}
            disabled={otpCode.length < OTP_LENGTH || isLoading}
            className="h-14 w-full rounded-xl text-base"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Vérification...
              </>
            ) : (
              'Vérifier'
            )}
          </Button>

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={() => {
                setStep('phone');
                setOtpCode('');
                setOtpError(null);
              }}
              className="text-ink-muted hover:text-ink"
            >
              Modifier le numéro
            </button>
            <button
              type="button"
              onClick={handleResend}
              disabled={isLoading}
              className="font-semibold text-green-forest hover:text-green-deep disabled:opacity-50"
            >
              Renvoyer le code
            </button>
          </div>
        </div>
      )}

      <p className="pt-4 text-center text-sm text-ink-muted">
        Besoin d&apos;aide ?{' '}
        <a
          href={supportHref}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-green-forest hover:text-green-deep"
        >
          Contactez le support
        </a>
      </p>

      {/* Sans ce lien, la page de connexion est une impasse : on ne peut pas
          revenir à la boutique tant qu'on n'est pas authentifié. */}
      <p className="border-t border-neutral-300 pt-4 text-center">
        <Link
          href={ROUTES.home}
          className="inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Retour à la boutique
        </Link>
      </p>
    </div>
  );
}
