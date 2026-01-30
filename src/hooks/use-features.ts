'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Features {
  promo_codes: boolean;
  loyalty_program: boolean;
  loyalty_rewards: boolean;
  reviews: boolean;
}

const DEFAULT_FEATURES: Features = {
  promo_codes: false,
  loyalty_program: false,
  loyalty_rewards: false,
  reviews: false,
};

export function useFeatures() {
  const [features, setFeatures] = useState<Features>(DEFAULT_FEATURES);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('app_features')
          .select('feature_key, is_enabled');

        if (error) {
          console.error('Error fetching features:', error);
          return;
        }

        const featuresMap = data?.reduce(
          (acc, f) => {
            acc[f.feature_key as keyof Features] = f.is_enabled;
            return acc;
          },
          { ...DEFAULT_FEATURES }
        );

        setFeatures(featuresMap);
      } catch (error) {
        console.error('Error fetching features:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeatures();
  }, []);

  return {
    isLoading,
    promoCodesEnabled: features.promo_codes,
    loyaltyProgramEnabled: features.loyalty_program,
    loyaltyRewardsEnabled: features.loyalty_rewards,
    reviewsEnabled: features.reviews,
  };
}
