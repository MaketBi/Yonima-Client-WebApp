'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { CountryPicker } from './country-picker';
import { formatPhoneDisplay, isPhoneComplete } from '@/lib/validators';
import type { CountryData } from '@/types/auth';
import { DEFAULT_COUNTRY } from '@/types/auth';

interface PhoneInputProps {
  countries: CountryData[];
  value: string;
  onChange: (phone: string, fullPhone: string, isComplete: boolean) => void;
  disabled?: boolean;
  initialCountryCode?: string;
}

export function PhoneInput({
  countries,
  value,
  onChange,
  disabled = false,
  initialCountryCode = '+221',
}: PhoneInputProps) {
  // Find initial country or use default
  const initialCountry =
    countries.find((c) => c.dial_code === initialCountryCode) ||
    countries.find((c) => c.iso_code === 'SN') ||
    DEFAULT_COUNTRY;

  const [selectedCountry, setSelectedCountry] = useState<CountryData>(initialCountry);

  // Update selected country when countries load
  useEffect(() => {
    if (countries.length > 0) {
      const country =
        countries.find((c) => c.dial_code === initialCountryCode) ||
        countries.find((c) => c.iso_code === 'SN') ||
        countries[0];
      setSelectedCountry(country);
    }
  }, [countries, initialCountryCode]);

  const handlePhoneChange = useCallback(
    (inputValue: string) => {
      // Keep only digits
      const digits = inputValue.replace(/\D/g, '');

      // Limit to phone length
      const limitedDigits = digits.slice(0, selectedCountry.phone_length);

      // Format for display
      const formatted = formatPhoneDisplay(limitedDigits, selectedCountry.phone_pattern);

      // Full phone with country code
      const fullPhone = `${selectedCountry.dial_code}${limitedDigits}`;

      // Check if complete
      const complete = isPhoneComplete(limitedDigits, selectedCountry.phone_length);

      onChange(formatted, fullPhone, complete);
    },
    [selectedCountry, onChange]
  );

  const handleCountrySelect = useCallback(
    (country: CountryData) => {
      setSelectedCountry(country);
      // Reset phone when country changes
      onChange('', country.dial_code, false);
    },
    [onChange]
  );

  return (
    <div className="flex gap-2">
      <CountryPicker
        countries={countries.length > 0 ? countries : [DEFAULT_COUNTRY]}
        selectedCountry={selectedCountry}
        onCountrySelect={handleCountrySelect}
      />
      <Input
        type="tel"
        inputMode="numeric"
        placeholder={selectedCountry.phone_placeholder}
        value={value}
        onChange={(e) => handlePhoneChange(e.target.value)}
        disabled={disabled}
        className="flex-1 h-12 text-lg"
        autoComplete="tel"
      />
    </div>
  );
}
