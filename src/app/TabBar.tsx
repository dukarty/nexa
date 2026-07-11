/** Navegación inferior: 5 destinos, con la diana central como acción principal (vivir el reto). */

export type Tab = 'home' | 'messages' | 'challenge' | 'ranking' | 'profile';

const ITEMS: { id: Tab; label: string; icon: string }[] = [
  { id: 'home', label: 'Inicio', icon: '⌂' },
  { id: 'messages', label: 'Mensajes', icon: '✉' },
  { id: 'challenge', label: '', icon: '◎' },
  { id: 'ranking', label: 'Ranking', icon: '♛' },
  { id: 'profile', label: 'Perfil', icon: '☺' },
];

export function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-20 mx-auto flex w-full max-w-[440px] items-end justify-around border-t border-line bg-surface/95 px-2 pb-[max(10px,var(--safe-bottom))] pt-2 backdrop-blur"
    >
      {ITEMS.map((it) =>
        it.id === 'challenge' ? (
          <button
            key={it.id}
            onClick={() => onChange(it.id)}
            aria-label="Reto de la semana"
            aria-current={active === it.id ? 'page' : undefined}
            className="-mt-6 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-b from-blue to-blue-dark text-2xl text-white shadow-blue transition active:scale-95"
          >
            {it.icon}
          </button>
        ) : (
          <button
            key={it.id}
            onClick={() => onChange(it.id)}
            aria-current={active === it.id ? 'page' : undefined}
            className={`flex flex-1 flex-col items-center gap-0.5 py-1 text-[11px] font-semibold transition ${
              active === it.id ? 'text-blue' : 'text-muted'
            }`}
          >
            <span className="text-lg leading-none">{it.icon}</span>
            {it.label}
          </button>
        ),
      )}
    </nav>
  );
}
