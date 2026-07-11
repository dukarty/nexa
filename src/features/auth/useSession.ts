import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export type AuthState = 'loading' | 'signed_out' | 'needs_onboarding' | 'active';

/** Fuente única de verdad de la sesión. Distingue los estados de cuenta. */
export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [state, setState] = useState<AuthState>('loading');

  useEffect(() => {
    let alive = true;

    async function resolve(s: Session | null) {
      if (!alive) return;
      setSession(s);
      if (!s) return setState('signed_out');
      const { data } = await supabase
        .from('user_profiles')
        .select('profile_complete')
        .eq('user_id', s.user.id)
        .maybeSingle();
      if (!alive) return;
      setState(data?.profile_complete ? 'active' : 'needs_onboarding');
    }

    supabase.auth.getSession().then(({ data }) => resolve(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => resolve(s));
    return () => { alive = false; sub.subscription.unsubscribe(); };
  }, []);

  return { session, state };
}
