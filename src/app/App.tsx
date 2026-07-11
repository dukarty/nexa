import { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useSession } from '@/features/auth/useSession';
import { AuthScreen } from '@/features/auth/AuthScreen';
import { OnboardingFlow } from '@/features/onboarding/OnboardingFlow';
import { HomeScreen } from '@/features/home/HomeScreen';
import { TabBar, type Tab } from './TabBar';

/**
 * Shell de la aplicación.
 * Una única fuente de verdad (useSession) decide qué se monta:
 * sin sesión → Auth · sesión sin perfil → Onboarding · perfil completo → app con pestañas.
 */
function Shell() {
  const { state, session, refresh } = useSession();
  const [tab, setTab] = useState<Tab>('home');

  if (state === 'loading') {
    return (
      <div className="app-shell">
        <div className="grid flex-1 place-items-center">
          <div className="animate-fade text-center">
            <div className="text-[26px] font-extrabold tracking-[4px]">
              NE<span className="text-blue">X</span>A
            </div>
            <p className="mt-3 text-sm text-muted">Cargando tu año…</p>
          </div>
        </div>
      </div>
    );
  }

  if (state === 'signed_out') {
    return (
      <div className="app-shell">
        <AuthScreen />
      </div>
    );
  }

  if (state === 'needs_onboarding' && session) {
    return (
      <div className="app-shell">
        <OnboardingFlow userId={session.user.id} onDone={refresh} />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="app-shell">
      {tab === 'home' && <HomeScreen userId={session.user.id} />}
      {tab !== 'home' && <ComingSoon tab={tab} />}
      <TabBar active={tab} onChange={setTab} />
    </div>
  );
}

/** Pestañas de bloques aún no construidos. Honestas: no fingen contenido. */
function ComingSoon({ tab }: { tab: Tab }) {
  const copy: Record<Exclude<Tab, 'home'>, { title: string; desc: string }> = {
    challenge: { title: 'Retos', desc: 'La temporada de 52 semanas y el detalle de cada reto. Bloque 5.' },
    ranking: { title: 'Ranking', desc: 'Aquí se mide cuánto vive la gente. Bloque 11.' },
    messages: { title: 'Mensajes', desc: 'Conecta con gente afín. Bloque 13.' },
    profile: { title: 'Perfil', desc: 'Tu pasaporte anual y tu año en experiencias. Bloque 10.' },
  };
  const c = copy[tab as Exclude<Tab, 'home'>];
  return (
    <div className="grid flex-1 place-items-center p-8 text-center animate-fade">
      <div>
        <h1 className="text-lg font-extrabold text-ink">{c.title}</h1>
        <p className="mt-2 text-sm leading-snug text-muted">{c.desc}</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Shell />
    </QueryClientProvider>
  );
}
