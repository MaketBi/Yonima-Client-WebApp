'use client';

import { useEffect, useCallback, useRef } from 'react';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { useUserStore } from '@/stores/user-store';
import type { User } from '@/types/models';

export function useAuth() {
  const user = useUserStore((state) => state.user);
  const isLoading = useUserStore((state) => state.isLoading);
  const _hasHydrated = useUserStore((state) => state._hasHydrated);
  const setUser = useUserStore((state) => state.setUser);
  const setLoading = useUserStore((state) => state.setLoading);
  const clear = useUserStore((state) => state.clear);

  const initializedRef = useRef(false);

  useEffect(() => {
    // Wait for store hydration before checking session
    if (!_hasHydrated) return;

    // Only run once after hydration
    if (initializedRef.current) return;
    initializedRef.current = true;

    const supabase = createClient();

    // Get current user from store at this moment
    const currentUser = useUserStore.getState().user;

    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          // Only fetch profile if we don't have user or user id changed
          if (!currentUser || currentUser.id !== session.user.id) {
            const { data: profile } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single();

            setUser(profile as User | null);
          } else {
            // Just stop loading, we already have the user from persisted store
            setLoading(false);
          }
        } else {
          // No session from Supabase - keep user from store if exists
          setLoading(false);
        }
      } catch (error) {
        console.error('Error getting session:', error);
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // Fetch user profile
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          setUser(profile as User | null);
        } else if (event === 'SIGNED_OUT') {
          clear();
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          // Token was refreshed, user is still logged in
          const storeUser = useUserStore.getState().user;
          if (!storeUser) {
            const { data: profile } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single();

            setUser(profile as User | null);
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [_hasHydrated, setUser, setLoading, clear]);

  const signOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    clear();
  }, [clear]);

  const refreshUser = useCallback(async () => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      setUser(profile as User | null);
    }
  }, [setUser]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    signOut,
    refreshUser,
  };
}
