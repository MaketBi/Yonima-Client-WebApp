'use client';

import { useState, useCallback } from 'react';
import { DEFAULT_LATITUDE, DEFAULT_LONGITUDE } from '@/lib/constants';

interface LocationState {
  latitude: number;
  longitude: number;
  address: string;
  isLoading: boolean;
  error: string | null;
  hasPermission: boolean | null;
}

export function useLocation() {
  const [state, setState] = useState<LocationState>({
    latitude: DEFAULT_LATITUDE,
    longitude: DEFAULT_LONGITUDE,
    address: '',
    isLoading: false,
    error: null,
    hasPermission: null,
  });

  const requestLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: 'La géolocalisation n\'est pas supportée par votre navigateur',
        hasPermission: false,
      }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        });
      });

      const { latitude, longitude } = position.coords;

      // Reverse geocoding using Nominatim (free, no API key)
      let address = '';
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=fr`
        );
        const data = await response.json();
        address = data.display_name || '';

        // Simplify address for display
        if (data.address) {
          const parts = [];
          if (data.address.road) parts.push(data.address.road);
          if (data.address.suburb) parts.push(data.address.suburb);
          if (data.address.city || data.address.town) {
            parts.push(data.address.city || data.address.town);
          }
          if (parts.length > 0) {
            address = parts.join(', ');
          }
        }
      } catch (geocodeError) {
        console.error('Geocoding error:', geocodeError);
        address = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      }

      setState({
        latitude,
        longitude,
        address,
        isLoading: false,
        error: null,
        hasPermission: true,
      });
    } catch (error) {
      const geoError = error as GeolocationPositionError;
      let errorMessage = 'Erreur lors de la récupération de votre position';

      switch (geoError.code) {
        case geoError.PERMISSION_DENIED:
          errorMessage = 'Accès à la localisation refusé';
          break;
        case geoError.POSITION_UNAVAILABLE:
          errorMessage = 'Position non disponible';
          break;
        case geoError.TIMEOUT:
          errorMessage = 'Délai d\'attente dépassé';
          break;
      }

      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        hasPermission: geoError.code !== geoError.PERMISSION_DENIED ? prev.hasPermission : false,
      }));
    }
  }, []);

  const setAddress = useCallback((address: string, latitude?: number, longitude?: number) => {
    setState((prev) => ({
      ...prev,
      address,
      ...(latitude !== undefined && { latitude }),
      ...(longitude !== undefined && { longitude }),
    }));
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    requestLocation,
    setAddress,
    clearError,
  };
}
