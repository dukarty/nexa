import { useCallback, useEffect, useRef, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export type AuthState = 'loading' | 'signed_out' | 'needs_onboarding' | 'active';

/** Fuente única de verdad de la sesión. Distingue los estados de cuenta. */
export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [state, setState] = useState<AuthState>('loading');
  const alive = useRef(true);

  const resolve = useCallback(async (s: Session | null) => {
    if (!alive.current) return;
    setSession(s);
    if (!s) return setState('signed_out');
    const { data } = await supabase
      .from('user_profiles')
      .select('profile_complete')
      .eq('user_id', s.user.id)
      .maybeSingle();
    if (!alive.current) return;
    setState(data?.profile_complete ? 'active' : 'needs_onboarding');
  }, []);

  /** Re-evalúa el estado sin recargar la página (p. ej. al terminar el onboarding). */
  const refresh = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    await resolve(data.session);
  }, [resolve]);

  useEffect(() => {
    alive.current = true;
    supabase.auth.getSession().then(({ data }) => resolve(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => resolve(s));
    return () => {
      alive.current = false;
      sub.subscription.unsubscribe();
    };
  }, [resolve]);

  return { session, state, refresh };
}
