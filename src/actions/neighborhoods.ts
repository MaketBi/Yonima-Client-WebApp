'use server';

import { createServerClient } from '@/lib/supabase/server';

// ============================================
// TYPES FOR NEIGHBORHOODS
// ============================================

export interface Neighborhood {
  id: string;
  name: string;
  city: string;
  latitude: number;
  longitude: number;
  radius: number;
  is_active: boolean;
}

export interface NeighborhoodsResponse {
  success: boolean;
  neighborhoods: Neighborhood[];
  cities: string[];
  error?: string;
}

// ============================================
// NEIGHBORHOOD ACTIONS
// ============================================

/**
 * Get all active neighborhoods from the database
 * Also extracts unique cities from the neighborhoods
 */
export async function getNeighborhoods(): Promise<NeighborhoodsResponse> {
  try {
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from('neighborhoods')
      .select('id, name, city, latitude, longitude, radius, is_active')
      .eq('is_active', true)
      .order('city', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching neighborhoods:', error);
      return {
        success: false,
        neighborhoods: [],
        cities: [],
        error: error.message,
      };
    }

    const neighborhoods = data as Neighborhood[];

    // Extract unique cities sorted
    const cities = [...new Set(neighborhoods.map((n) => n.city))].sort();

    return {
      success: true,
      neighborhoods,
      cities,
    };
  } catch (error) {
    console.error('Error fetching neighborhoods:', error);
    return {
      success: false,
      neighborhoods: [],
      cities: [],
      error: error instanceof Error ? error.message : 'Erreur de connexion',
    };
  }
}

/**
 * Get neighborhoods for a specific city
 */
export async function getNeighborhoodsByCity(city: string): Promise<Neighborhood[]> {
  const response = await getNeighborhoods();
  if (!response.success) return [];
  return response.neighborhoods.filter((n) => n.city === city);
}

/**
 * Check if coordinates are within any delivery zone
 * Uses Haversine formula to calculate distance
 */
export async function checkDeliveryZoneCoverage(
  latitude: number,
  longitude: number
): Promise<{ isCovered: boolean; nearestNeighborhood?: Neighborhood }> {
  const response = await getNeighborhoods();

  if (!response.success || response.neighborhoods.length === 0) {
    return { isCovered: false };
  }

  let nearestNeighborhood: Neighborhood | undefined;
  let minDistance = Infinity;

  for (const neighborhood of response.neighborhoods) {
    const distance = calculateHaversineDistance(
      latitude,
      longitude,
      neighborhood.latitude,
      neighborhood.longitude
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearestNeighborhood = neighborhood;
    }

    // Check if within radius (in meters)
    if (distance <= neighborhood.radius) {
      return { isCovered: true, nearestNeighborhood: neighborhood };
    }
  }

  return { isCovered: false, nearestNeighborhood };
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @returns Distance in meters
 */
function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}
