'use server';

import { createServerClient } from '@/lib/supabase/server';

/**
 * Get the default landmark for the current user
 */
export async function getDefaultLandmark(): Promise<string | null> {
  try {
    const supabase = await createServerClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return null;
    }

    const { data, error } = await supabase
      .from('users')
      .select('default_landmark')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching default landmark:', error);
      return null;
    }

    return data?.default_landmark || null;
  } catch (error) {
    console.error('Error fetching default landmark:', error);
    return null;
  }
}

/**
 * Update the default landmark for the current user
 */
export async function updateDefaultLandmark(landmark: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Non authentifié' };
    }

    const { error } = await supabase
      .from('users')
      .update({ default_landmark: landmark })
      .eq('id', user.id);

    if (error) {
      console.error('Error updating default landmark:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating default landmark:', error);
    return { success: false, error: 'Erreur lors de la mise à jour' };
  }
}
