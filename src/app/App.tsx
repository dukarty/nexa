import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useSession } from '@/features/auth/useSession';
import { AuthScreen } from '@/features/auth/AuthScreen';

/**
 * Shell de la aplicación (Bloque 1 · Fundamentos).
 * Detecta el estado de sesión y monta el enrutado correspondiente.
 * Los bloques siguientes (Auth, Onboarding, Home…) se enchufan aquí.
 */
function Shell() {
  const { state } = useSession();

  return (
    <div className="app-shell">
      {state === 'loading' && (
        <div className="flex-1 grid place-items-center">
          <div className="text-center animate-fade">
            <div className="text-[26px] font-extrabold tracking-[4px]">
              NE<span className="text-blue">X</span>A
            </div>
            <p className="mt-3 text-muted text-sm">Cargando tu año…</p>
          </div>
        </div>
      )}

      {state === 'signed_out' && <AuthScreen />}
      {state === 'needs_onboarding' && (
        <Placeholder title="Bloque 3 · Onboarding" desc="Cuestionario por tarjetas y datos básicos." />
      )}
      {state === 'active' && (
        <Placeholder title="Bloque 4 · Home" desc="Reto semanal, cuenta atrás y feed bloqueado." />
      )}
    </div>
  );
}

function Placeholder({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex-1 grid place-items-center p-6 animate-fade">
      <div className="text-center">
        <div className="text-[22px] font-extrabold tracking-[4px] mb-4">
          NE<span className="text-blue">X</span>A
        </div>
        <h1 className="text-lg font-bold">{title}</h1>
        <p className="text-muted mt-2 text-sm">{desc}</p>
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
