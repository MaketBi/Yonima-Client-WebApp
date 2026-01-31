'use client';

import { useState, useMemo } from 'react';
import { Search, Check, ChevronDown } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { CountryData } from '@/types/auth';

interface CountryPickerProps {
  countries: CountryData[];
  selectedCountry: CountryData;
  onCountrySelect: (country: CountryData) => void;
}

export function CountryPicker({
  countries,
  selectedCountry,
  onCountrySelect,
}: CountryPickerProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return countries;

    const query = searchQuery.toLowerCase();
    return countries.filter(
      (country) =>
        country.name.toLowerCase().includes(query) ||
        country.dial_code.includes(query) ||
        country.iso_code.toLowerCase().includes(query)
    );
  }, [countries, searchQuery]);

  const handleSelect = (country: CountryData) => {
    onCountrySelect(country);
    setOpen(false);
    setSearchQuery('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 px-3 h-12 min-w-[100px]"
        >
          <span className="text-xl">{selectedCountry.flag_emoji}</span>
          <span className="text-sm font-medium">{selectedCountry.dial_code}</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sélectionner un pays</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un pays..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Country list */}
          <ScrollArea className="h-[300px]">
            <div className="space-y-1">
              {filteredCountries.map((country) => (
                <button
                  key={country.id}
                  onClick={() => handleSelect(country)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <span className="text-2xl">{country.flag_emoji}</span>
                  <div className="flex-1 text-left">
                    <p className="font-medium">{country.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {country.dial_code}
                    </p>
                  </div>
                  {country.id === selectedCountry.id && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </button>
              ))}
              {filteredCountries.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Aucun pays trouvé
                </p>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
