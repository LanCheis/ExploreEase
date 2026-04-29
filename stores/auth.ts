import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';
import type { Interest, Profile } from '@/types/profile';

interface AuthState {
  session: Session | null;
  profile: Profile | null;
  interests: Interest[];
  isLoading: boolean;
  init: () => Promise<() => void>;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  profile: null,
  interests: [],
  isLoading: true,

  init: async () => {
    const { data } = await supabase.auth.getSession();
    set({ session: data.session });

    if (data.session) {
      await get().refreshProfile();
    }

    set({ isLoading: false });

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      set({ session });
      if (session) {
        await get().refreshProfile();
      } else {
        set({ profile: null, interests: [] });
      }
    });

    return () => sub.subscription.unsubscribe();
  },

  refreshProfile: async () => {
    const session = get().session;
    if (!session) return;

    const [profileRes, interestsRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle(),
      supabase.from('user_interests').select('interest').eq('user_id', session.user.id),
    ]);

    set({
      profile: (profileRes.data as Profile | null) ?? null,
      interests: (interestsRes.data ?? []).map((r) => r.interest as Interest),
    });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ profile: null, interests: [] });
  },
}));

export function isProfileComplete(
  profile: Profile | null,
  interests: Interest[],
): boolean {
  return profile?.travel_style != null && interests.length > 0;
}
