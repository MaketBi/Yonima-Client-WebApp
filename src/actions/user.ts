'use server';

import { createServerClient } from '@/lib/supabase/server';
import type { User } from '@/types/models';

/**
 * Get the current user profile
 */
export async function getUserProfile(): Promise<User | null> {
  try {
    const supabase = await createServerClient();

    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      return null;
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data as User;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(data: {
  full_name?: string;
  email?: string;
}): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const supabase = await createServerClient();

    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      return { success: false, error: 'Non authentifié' };
    }

    const updateData: Record<string, unknown> = {};
    if (data.full_name !== undefined) updateData.full_name = data.full_name;
    if (data.email !== undefined) updateData.email = data.email || null;

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', authUser.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      return { success: false, error: error.message };
    }

    return { success: true, user: updatedUser as User };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { success: false, error: 'Erreur lors de la mise à jour' };
  }
}

/**
 * Upload avatar image and update user profile
 */
export async function uploadAvatar(formData: FormData): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const supabase = await createServerClient();

    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      return { success: false, error: 'Non authentifié' };
    }

    const file = formData.get('file') as File;
    if (!file) {
      return { success: false, error: 'Aucun fichier fourni' };
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return { success: false, error: 'Le fichier doit être une image' };
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: 'L\'image ne doit pas dépasser 5 Mo' };
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${authUser.id}/avatar-${Date.now()}.${fileExt}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      console.error('Error uploading avatar:', uploadError);
      return { success: false, error: 'Erreur lors de l\'upload' };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    // Update user profile with avatar URL
    const { error: updateError } = await supabase
      .from('users')
      .update({ avatar_url: publicUrl })
      .eq('id', authUser.id);

    if (updateError) {
      console.error('Error updating avatar URL:', updateError);
      return { success: false, error: 'Erreur lors de la mise à jour du profil' };
    }

    return { success: true, url: publicUrl };
  } catch (error) {
    console.error('Error uploading avatar:', error);
    return { success: false, error: 'Erreur lors de l\'upload' };
  }
}

/**
 * Delete user account
 */
export async function deleteAccount(): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerClient();

    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      return { success: false, error: 'Non authentifié' };
    }

    // Mark user as inactive instead of deleting (for data retention)
    const { error: updateError } = await supabase
      .from('users')
      .update({
        is_active: false,
        full_name: 'Compte supprimé',
        email: null,
        avatar_url: null,
      })
      .eq('id', authUser.id);

    if (updateError) {
      console.error('Error deactivating account:', updateError);
      return { success: false, error: updateError.message };
    }

    // Sign out the user
    await supabase.auth.signOut();

    return { success: true };
  } catch (error) {
    console.error('Error deleting account:', error);
    return { success: false, error: 'Erreur lors de la suppression' };
  }
}

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
