'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { PhoneInput } from './phone-input';
import { OtpModal } from './otp-modal';
import { requestOtp, verifyOtp } from '@/actions/auth';
import { createClient } from '@/lib/supabase/client';
import { canAttempt, recordAttempt, resetAttempts, getWaitTimeSeconds } from '@/lib/rate-limiter';
import { sanitizeName, isValidName } from '@/lib/validators';
import type { CountryData, OTPChannel } from '@/types/auth';
import { APP_NAME } from '@/lib/constants';

interface AuthFormProps {
  mode: 'login' | 'register';
  countries: CountryData[];
  initialPhone?: string;
  initialCountryCode?: string;
}

export function AuthForm({
  mode,
  countries,
  initialPhone = '',
  initialCountryCode = '+221',
}: AuthFormProps) {
  const router = useRouter();

  // Form state
  const [phoneDisplay, setPhoneDisplay] = useState(initialPhone);
  const [fullPhone, setFullPhone] = useState('');
  const [isPhoneComplete, setIsPhoneComplete] = useState(false);
  const [fullName, setFullName] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);

  // OTP modal state
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpChannel, setOtpChannel] = useState<OTPChannel>('whatsapp');

  // Dialog for user not found / already exists
  const [showNotFoundDialog, setShowNotFoundDialog] = useState(false);
  const [showAlreadyExistsDialog, setShowAlreadyExistsDialog] = useState(false);

  // Form validation
  const isNameValid = mode === 'login' || isValidName(fullName);
  const isFormValid = isPhoneComplete && isNameValid;

  // Handle phone change
  const handlePhoneChange = useCallback(
    (display: string, full: string, complete: boolean) => {
      setPhoneDisplay(display);
      setFullPhone(full);
      setIsPhoneComplete(complete);
      setError(null);
    },
    []
  );

  // Handle name change
  const handleNameChange = useCallback((value: string) => {
    setFullName(sanitizeName(value));
    setError(null);
  }, []);

  // Handle form submit
  const handleSubmit = useCallback(async () => {
    if (!isFormValid || isLoading) return;

    // Check rate limiting
    const rateLimitKey = `otp_request:${fullPhone}`;
    if (!canAttempt(rateLimitKey, 'otp_request')) {
      const waitTime = getWaitTimeSeconds(rateLimitKey, 'otp_request');
      setError(`Trop de demandes. Réessayez dans ${waitTime} secondes.`);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await requestOtp(
        fullPhone,
        mode,
        mode === 'register' ? fullName : undefined
      );

      // Record attempt for rate limiting
      recordAttempt(rateLimitKey);

      if (result.success) {
        setOtpChannel(result.channel || 'whatsapp');
        setShowOtpModal(true);
      } else {
        // Handle specific error types
        switch (result.errorType) {
          case 'USER_NOT_FOUND':
            setShowNotFoundDialog(true);
            break;
          case 'USER_ALREADY_EXISTS':
            setShowAlreadyExistsDialog(true);
            break;
          default:
            setError(result.error || 'Une erreur est survenue');
        }
      }
    } catch (err) {
      setError('Erreur réseau. Vérifiez votre connexion.');
    } finally {
      setIsLoading(false);
    }
  }, [isFormValid, isLoading, fullPhone, fullName, mode]);

  // Handle OTP verification
  const handleVerifyOtp = useCallback(
    async (code: string) => {
      // Check rate limiting
      const rateLimitKey = `otp_verify:${fullPhone}`;
      if (!canAttempt(rateLimitKey, 'otp')) {
        const waitTime = getWaitTimeSeconds(rateLimitKey, 'otp');
        setOtpError(`Trop de tentatives. Réessayez dans ${waitTime} secondes.`);
        return;
      }

      recordAttempt(rateLimitKey);

      const result = await verifyOtp(fullPhone, code);

      if (result.success && result.accessToken) {
        // Reset rate limiters
        resetAttempts(rateLimitKey);
        resetAttempts(`otp_request:${fullPhone}`);

        // Initialize Supabase session on client side
        const supabase = createClient();
        await supabase.auth.setSession({
          access_token: result.accessToken,
          refresh_token: result.refreshToken || '',
        });

        // Close modal and redirect
        setShowOtpModal(false);
        router.push('/');
        router.refresh();
      } else {
        setOtpError(result.error || 'Code incorrect');
      }
    },
    [fullPhone, router]
  );

  // Handle resend OTP
  const handleResendOtp = useCallback(async () => {
    setOtpError(null);
    const result = await requestOtp(
      fullPhone,
      mode,
      mode === 'register' ? fullName : undefined
    );

    if (!result.success) {
      setOtpError(result.error || 'Erreur lors du renvoi');
    } else if (result.channel) {
      setOtpChannel(result.channel);
    }
  }, [fullPhone, mode, fullName]);

  // Navigate to other auth mode
  const handleGoToRegister = useCallback(() => {
    setShowNotFoundDialog(false);
    router.push(`/register?phone=${encodeURIComponent(phoneDisplay)}`);
  }, [router, phoneDisplay]);

  const handleGoToLogin = useCallback(() => {
    setShowAlreadyExistsDialog(false);
    router.push(`/login?phone=${encodeURIComponent(phoneDisplay)}`);
  }, [router, phoneDisplay]);

  return (
    <div className="space-y-6">
      {/* Form */}
      <div className="space-y-4">
        {/* Full name (register only) */}
        {mode === 'register' && (
          <div className="space-y-2">
            <Label htmlFor="fullName">Nom complet</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Votre nom"
              value={fullName}
              onChange={(e) => handleNameChange(e.target.value)}
              disabled={isLoading}
              className="h-12"
              autoComplete="name"
            />
          </div>
        )}

        {/* Phone input */}
        <div className="space-y-2">
          <Label htmlFor="phone">Numéro de téléphone</Label>
          <PhoneInput
            countries={countries}
            value={phoneDisplay}
            onChange={handlePhoneChange}
            disabled={isLoading}
            initialCountryCode={initialCountryCode}
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit button */}
        <Button
          onClick={handleSubmit}
          disabled={!isFormValid || isLoading}
          className="w-full h-12"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Envoi du code...
            </>
          ) : mode === 'login' ? (
            'Se connecter'
          ) : (
            "S'inscrire"
          )}
        </Button>
      </div>

      {/* Link to other mode */}
      <p className="text-center text-sm text-muted-foreground">
        {mode === 'login' ? (
          <>
            Pas encore de compte ?{' '}
            <Link href="/register" className="text-primary hover:underline">
              S&apos;inscrire
            </Link>
          </>
        ) : (
          <>
            Déjà un compte ?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Se connecter
            </Link>
          </>
        )}
      </p>

      {/* OTP Modal */}
      <OtpModal
        open={showOtpModal}
        onOpenChange={setShowOtpModal}
        phoneNumber={fullPhone}
        channel={otpChannel}
        onConfirm={handleVerifyOtp}
        onResendCode={handleResendOtp}
        error={otpError || undefined}
      />

      {/* User Not Found Dialog */}
      <Dialog open={showNotFoundDialog} onOpenChange={setShowNotFoundDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Compte introuvable</DialogTitle>
            <DialogDescription>
              Aucun compte n&apos;est associé à ce numéro. Souhaitez-vous créer un compte ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowNotFoundDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleGoToRegister}>Créer un compte</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Already Exists Dialog */}
      <Dialog open={showAlreadyExistsDialog} onOpenChange={setShowAlreadyExistsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Compte existant</DialogTitle>
            <DialogDescription>
              Ce numéro a déjà un compte {APP_NAME}. Souhaitez-vous vous connecter ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowAlreadyExistsDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleGoToLogin}>Se connecter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
