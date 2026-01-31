'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, Smartphone, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { sanitizeOTP, isValidOTP } from '@/lib/validators';
import type { OTPChannel } from '@/types/auth';
import { OTP_CHANNEL_MESSAGES } from '@/types/auth';

interface OtpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phoneNumber: string;
  channel: OTPChannel;
  onConfirm: (code: string) => Promise<void>;
  onResendCode: () => Promise<void>;
  error?: string;
}

export function OtpModal({
  open,
  onOpenChange,
  phoneNumber,
  channel,
  onConfirm,
  onResendCode,
  error,
}: OtpModalProps) {
  const [otpCode, setOtpCode] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isOtpComplete = isValidOTP(otpCode);

  // Countdown timer
  useEffect(() => {
    if (!open) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [open]);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setOtpCode('');
      setCountdown(60);
      setCanResend(false);
      setIsVerifying(false);
      // Focus input after a short delay
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  const handleOtpChange = useCallback((value: string) => {
    const sanitized = sanitizeOTP(value);
    setOtpCode(sanitized);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!isOtpComplete || isVerifying) return;

    setIsVerifying(true);
    try {
      await onConfirm(otpCode);
    } finally {
      setIsVerifying(false);
    }
  }, [otpCode, isOtpComplete, isVerifying, onConfirm]);

  const handleResend = useCallback(async () => {
    if (!canResend || isResending) return;

    setIsResending(true);
    try {
      await onResendCode();
      setCountdown(60);
      setCanResend(false);
      setOtpCode('');
    } finally {
      setIsResending(false);
    }
  }, [canResend, isResending, onResendCode]);

  // Handle Enter key
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && isOtpComplete) {
        handleConfirm();
      }
    },
    [isOtpComplete, handleConfirm]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Vérification</DialogTitle>
          <DialogDescription className="text-center">
            Entrez le code reçu
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Channel indicator */}
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            {channel === 'whatsapp' ? (
              <MessageCircle className="h-5 w-5 text-green-500" />
            ) : (
              <Smartphone className="h-5 w-5 text-blue-500" />
            )}
            <span>{OTP_CHANNEL_MESSAGES[channel]}</span>
          </div>

          {/* Phone number */}
          <p className="text-center font-medium">{phoneNumber}</p>

          {/* OTP Input */}
          <div className="space-y-2">
            <Input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={otpCode}
              onChange={(e) => handleOtpChange(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isVerifying}
              className={cn(
                'h-14 text-center text-3xl font-bold tracking-[0.5em] placeholder:tracking-[0.5em]',
                error && 'border-destructive'
              )}
              placeholder="------"
              autoComplete="one-time-code"
            />
            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}
          </div>

          {/* Confirm button */}
          <Button
            onClick={handleConfirm}
            disabled={!isOtpComplete || isVerifying}
            className="w-full h-12"
          >
            {isVerifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Vérification...
              </>
            ) : (
              'Confirmer'
            )}
          </Button>

          {/* Resend code */}
          <div className="text-center">
            {canResend ? (
              <button
                onClick={handleResend}
                disabled={isResending}
                className="text-sm text-primary hover:underline disabled:opacity-50"
              >
                {isResending ? 'Envoi en cours...' : 'Renvoyer le code'}
              </button>
            ) : (
              <p className="text-sm text-muted-foreground">
                Renvoyer le code dans {countdown}s
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
