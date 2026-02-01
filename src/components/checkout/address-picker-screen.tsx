'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Navigation, AlertTriangle, Loader2, Search, X, Home, Briefcase, Star, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useDeliveryAddressStore } from '@/stores/delivery-address-store';
import { getNeighborhoods, checkDeliveryZoneCoverage, type Neighborhood } from '@/actions/neighborhoods';
import { getUserAddresses, deleteAddress } from '@/actions/addresses';
import { getDefaultLandmark, updateDefaultLandmark } from '@/actions/user';
import type { DeliveryAddress } from '@/types/models';
import { useLocation } from '@/hooks/use-location';
import { useAuth } from '@/hooks/use-auth';
import { DEFAULT_LATITUDE, DEFAULT_LONGITUDE } from '@/lib/constants';

// Dynamic import for the map to avoid SSR issues
const AddressPickerMap = dynamic(
  () => import('./address-picker-map').then((mod) => mod.AddressPickerMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[200px] bg-gray-100 rounded-lg flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    ),
  }
);

// Map placeholder when dialog is not open
function MapPlaceholder() {
  return (
    <div className="w-full h-[200px] bg-gray-100 rounded-lg flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}

interface AddressPickerScreenProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm?: () => void;
}

export function AddressPickerScreen({ open, onOpenChange, onConfirm }: AddressPickerScreenProps) {
  const deliveryStore = useDeliveryAddressStore();
  const location = useLocation();
  const { user } = useAuth();

  // Local state
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [savedAddresses, setSavedAddresses] = useState<DeliveryAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [isCheckingZone, setIsCheckingZone] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isDeletingAddress, setIsDeletingAddress] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form state (local copy that syncs on confirm)
  const [selectedCity, setSelectedCity] = useState(deliveryStore.city || '');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(deliveryStore.neighborhood || '');
  const [searchAddress, setSearchAddress] = useState(deliveryStore.formattedAddress || '');
  const [additionalInfo, setAdditionalInfo] = useState(deliveryStore.additionalInfo || '');
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number }>({
    lat: deliveryStore.latitude || DEFAULT_LATITUDE,
    lng: deliveryStore.longitude || DEFAULT_LONGITUDE,
  });
  const [isZoneCovered, setIsZoneCovered] = useState(true);
  const [zoneMessage, setZoneMessage] = useState('');

  // Filtered neighborhoods based on selected city
  const neighborhoodsForCity = neighborhoods.filter((n) => n.city === selectedCity);

  // Track if we've already requested location for this dialog open
  const [hasRequestedLocation, setHasRequestedLocation] = useState(false);

  // Load neighborhoods, saved addresses, and default landmark on mount
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);

      // Load neighborhoods
      const response = await getNeighborhoods();
      if (response.success) {
        setNeighborhoods(response.neighborhoods);
        setCities(response.cities);
      }
      setIsLoading(false);

      // Load saved addresses and default landmark if user is logged in
      if (user) {
        setIsLoadingAddresses(true);

        // Load in parallel
        const [addresses, landmark] = await Promise.all([
          getUserAddresses(),
          getDefaultLandmark(),
        ]);

        setSavedAddresses(addresses);

        // Set default landmark if available and no additionalInfo is set yet
        if (landmark && !deliveryStore.additionalInfo) {
          setAdditionalInfo(landmark);
        }

        setIsLoadingAddresses(false);
      }
    }

    if (open) {
      loadData();
      // Delay map rendering to ensure dialog is fully mounted
      const timer = setTimeout(() => {
        setIsMapReady(true);
      }, 100);

      return () => clearTimeout(timer);
    } else {
      // Reset states when dialog closes
      setIsMapReady(false);
      setHasRequestedLocation(false);
    }
  }, [open, user, deliveryStore.additionalInfo]);

  // Auto-request location when dialog opens (if no address is set)
  useEffect(() => {
    if (open && !hasRequestedLocation && !deliveryStore.hasAddress()) {
      setHasRequestedLocation(true);
      location.requestLocation();
    }
  }, [open, hasRequestedLocation, deliveryStore, location]);

  // Sync local state when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedCity(deliveryStore.city || '');
      setSelectedNeighborhood(deliveryStore.neighborhood || '');
      setSearchAddress(deliveryStore.formattedAddress || '');
      setAdditionalInfo(deliveryStore.additionalInfo || '');
      setMarkerPosition({
        lat: deliveryStore.latitude || DEFAULT_LATITUDE,
        lng: deliveryStore.longitude || DEFAULT_LONGITUDE,
      });
      setIsZoneCovered(deliveryStore.isZoneCovered);
    }
  }, [open, deliveryStore]);

  // Check zone coverage when marker position changes
  const checkZoneCoverage = useCallback(async (lat: number, lng: number) => {
    setIsCheckingZone(true);
    const result = await checkDeliveryZoneCoverage(lat, lng);
    setIsZoneCovered(result.isCovered);

    if (result.isCovered && result.nearestNeighborhood) {
      setZoneMessage(`Zone de livraison : ${result.nearestNeighborhood.name}, ${result.nearestNeighborhood.city}`);
      // Auto-select city and neighborhood if covered
      setSelectedCity(result.nearestNeighborhood.city);
      setSelectedNeighborhood(result.nearestNeighborhood.name);
    } else {
      setZoneMessage('Zone non couverte - Nous ne livrons pas encore dans cette zone');
    }
    setIsCheckingZone(false);
  }, []);

  // Handle location request ("Me localiser" button)
  const handleLocateMe = async () => {
    await location.requestLocation();
  };

  // Update marker and check zone when location changes
  useEffect(() => {
    if (location.latitude && location.longitude && location.address) {
      setMarkerPosition({ lat: location.latitude, lng: location.longitude });
      setSearchAddress(location.address);
      checkZoneCoverage(location.latitude, location.longitude);
    }
  }, [location.latitude, location.longitude, location.address, checkZoneCoverage]);

  // Handle city change
  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    setSelectedNeighborhood(''); // Reset neighborhood when city changes
    setIsZoneCovered(true);
    setZoneMessage('');
  };

  // Handle neighborhood change
  const handleNeighborhoodChange = (neighborhoodName: string) => {
    setSelectedNeighborhood(neighborhoodName);
    const neighborhood = neighborhoods.find((n) => n.name === neighborhoodName && n.city === selectedCity);
    if (neighborhood) {
      setMarkerPosition({ lat: neighborhood.latitude, lng: neighborhood.longitude });
      setIsZoneCovered(true);
      setZoneMessage(`Zone de livraison : ${neighborhood.name}, ${neighborhood.city}`);
    }
  };

  // Handle map click to set position
  const handleMapClick = (lat: number, lng: number) => {
    setMarkerPosition({ lat, lng });
    checkZoneCoverage(lat, lng);
  };

  // Handle selecting a saved address
  const handleSelectSavedAddress = (address: DeliveryAddress) => {
    setSearchAddress(address.address);
    // Keep the additionalInfo (default_landmark) - don't override it

    if (address.latitude && address.longitude) {
      setMarkerPosition({ lat: address.latitude, lng: address.longitude });
      checkZoneCoverage(address.latitude, address.longitude);
    }
  };

  // Handle deleting a saved address
  const handleDeleteSavedAddress = async (addressId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeletingAddress(addressId);

    const result = await deleteAddress(addressId);
    if (result.success) {
      setSavedAddresses((prev) => prev.filter((a) => a.id !== addressId));
    }

    setIsDeletingAddress(null);
  };

  // Get icon for address label
  const getAddressIcon = (label?: string | null) => {
    switch (label?.toLowerCase()) {
      case 'maison':
      case 'domicile':
        return <Home className="h-4 w-4" />;
      case 'travail':
      case 'bureau':
        return <Briefcase className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  // Handle confirm
  const handleConfirm = async () => {
    setIsSaving(true);

    // Build formatted address
    let formattedAddress = searchAddress;
    if (!formattedAddress && selectedCity && selectedNeighborhood) {
      formattedAddress = `${selectedNeighborhood}, ${selectedCity}`;
    }

    // Update default_landmark in users table if user is logged in
    if (user && additionalInfo.trim()) {
      await updateDefaultLandmark(additionalInfo.trim());
    }

    // Update the global store - mark as manually set
    deliveryStore.setAddress({
      formattedAddress,
      city: selectedCity,
      neighborhood: selectedNeighborhood,
      latitude: markerPosition.lat,
      longitude: markerPosition.lng,
      additionalInfo,
      isZoneCovered,
      isManuallySet: true,
    });

    setIsSaving(false);
    onOpenChange(false);
    onConfirm?.();
  };

  // Check if form is valid - additionalInfo is required
  const isFormValid = isZoneCovered && (searchAddress || (selectedCity && selectedNeighborhood)) && additionalInfo.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto p-0 gap-0">
        {/* Header */}
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Adresse de livraison
          </DialogTitle>
          <DialogDescription>
            Sélectionnez votre adresse de livraison
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 space-y-4">
          {/* Map */}
          <div className="relative rounded-lg overflow-hidden border">
            {isMapReady ? (
              <AddressPickerMap
                position={markerPosition}
                onMapClick={handleMapClick}
              />
            ) : (
              <MapPlaceholder />
            )}

            {/* Locate me button on map */}
            <Button
              variant="secondary"
              size="sm"
              className="absolute bottom-3 right-3 shadow-lg"
              onClick={handleLocateMe}
              disabled={location.isLoading}
            >
              {location.isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Navigation className="h-4 w-4 mr-2" />
              )}
              Me localiser
            </Button>
          </div>

          {/* Saved Addresses */}
          {user && savedAddresses.length > 0 && (
            <div className="space-y-2">
              <Label>Adresses enregistrées</Label>
              <div className="space-y-2">
                {savedAddresses.map((address) => (
                  <div
                    key={address.id}
                    onClick={() => handleSelectSavedAddress(address)}
                    className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      {address.is_default ? (
                        <Star className="h-4 w-4 fill-current" />
                      ) : (
                        getAddressIcon(address.label)
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      {address.label && (
                        <p className="text-sm font-medium">{address.label}</p>
                      )}
                      <p className="text-sm text-muted-foreground truncate">
                        {address.address}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0"
                      onClick={(e) => handleDeleteSavedAddress(address.id, e)}
                      disabled={isDeletingAddress === address.id}
                    >
                      {isDeletingAddress === address.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Loading saved addresses */}
          {user && isLoadingAddresses && savedAddresses.length === 0 && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mr-2" />
              <span className="text-sm text-muted-foreground">Chargement des adresses...</span>
            </div>
          )}

          {/* Zone coverage warning */}
          {!isZoneCovered && (
            <div className="flex items-start gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-destructive">Zone non couverte</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Nous ne livrons pas encore dans cette zone. Veuillez sélectionner une adresse dans les villes de Dakar et environs.
                </p>
              </div>
            </div>
          )}

          {/* Zone info (when covered) */}
          {isZoneCovered && zoneMessage && (
            <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg">
              <MapPin className="h-4 w-4 text-green-600" />
              <p className="text-sm text-green-700">{zoneMessage}</p>
            </div>
          )}

          {/* Search Address */}
          <div className="space-y-2">
            <Label htmlFor="search-address">Adresse</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search-address"
                placeholder="Rechercher une adresse..."
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                className="pl-10"
              />
              {searchAddress && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setSearchAddress('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* City Selector */}
          <div className="space-y-2">
            <Label htmlFor="city">Ville</Label>
            <Select value={selectedCity} onValueChange={handleCityChange} disabled={isLoading}>
              <SelectTrigger id="city">
                <SelectValue placeholder={isLoading ? 'Chargement...' : 'Sélectionner une ville'} />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Neighborhood Selector */}
          <div className="space-y-2">
            <Label htmlFor="neighborhood">Quartier</Label>
            <Select
              value={selectedNeighborhood}
              onValueChange={handleNeighborhoodChange}
              disabled={!selectedCity || neighborhoodsForCity.length === 0}
            >
              <SelectTrigger id="neighborhood">
                <SelectValue
                  placeholder={
                    !selectedCity
                      ? 'Sélectionnez d\'abord une ville'
                      : neighborhoodsForCity.length === 0
                      ? 'Aucun quartier disponible'
                      : 'Sélectionner un quartier'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {neighborhoodsForCity.map((neighborhood) => (
                  <SelectItem key={neighborhood.id} value={neighborhood.name}>
                    {neighborhood.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Additional Info - Required */}
          <div className="space-y-2">
            <Label htmlFor="additional-info">
              Point de repère / Instructions <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="additional-info"
              placeholder="Ex: Immeuble bleu, 3ème étage, porte gauche..."
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              rows={2}
              className={!additionalInfo.trim() ? 'border-orange-300 focus:border-orange-500' : ''}
            />
            {!additionalInfo.trim() && (
              <p className="text-xs text-muted-foreground">
                Ce champ est obligatoire pour faciliter la livraison
              </p>
            )}
          </div>

          {/* Confirm Button */}
          <Button
            className="w-full h-12"
            onClick={handleConfirm}
            disabled={!isFormValid || isCheckingZone || isSaving}
          >
            {isCheckingZone ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Vérification...
              </>
            ) : isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Enregistrement...
              </>
            ) : (
              'Valider cette adresse'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
