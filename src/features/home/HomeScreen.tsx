import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button, Screen, Wordmark } from '@/design/ui';
import {
  fetchFeed,
  fetchHome,
  greeting,
  isoWeek,
  timeLeft,
  type FeedPost,
  type HomeData,
} from './homeApi';

/**
 * Bloque 4 · Home.
 * No es un feed: es tensión. El mundo está ocurriendo y tú todavía no has salido.
 * El feed permanece bloqueado hasta que el usuario vive su experiencia de la semana.
 */
export function HomeScreen({ userId }: { userId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['home', userId],
    queryFn: () => fetchHome(userId),
    staleTime: 30_000,
  });

  if (isLoading || !data) return <HomeSkeleton />;

  return (
    <Screen>
      <Header data={data} />
      <ChallengeCard data={data} />
      <FeedSection unlocked={data.unlocked} />
    </Screen>
  );
}

function Header({ data }: { data: HomeData }) {
  return (
    <header className="mb-7 flex items-start justify-between">
      <div>
        <Wordmark className="text-[19px]" />
        <h1 className="mt-3 text-[26px] font-extrabold leading-tight tracking-tight text-ink">
          {greeting(data.displayName)}
        </h1>
        <p className="mt-1 text-sm text-muted">
          Semana {data.challenge?.week_number ?? isoWeek()} de 52 · {data.streak > 0 ? `${data.streak} semana${data.streak === 1 ? '' : 's'} seguidas` : 'Empieza tu racha'}
        </p>
      </div>
    </header>
  );
}

/** Cuenta atrás viva: se refresca cada minuto, no cada segundo (ansiedad innecesaria). */
function Countdown({ endsAt }: { endsAt: string | null }) {
  const [t, setT] = useState(() => timeLeft(endsAt));
  useEffect(() => {
    const id = setInterval(() => setT(timeLeft(endsAt)), 60_000);
    return () => clearInterval(id);
  }, [endsAt]);

  if (t.over) return <span className="text-warn">La semana se acaba</span>;
  return (
    <span>
      Quedan <strong className="text-ink">{t.days}d {t.hours}h {t.minutes}m</strong>
    </span>
  );
}

function ChallengeCard({ data }: { data: HomeData }) {
  const { challenge, participation } = data;

  if (!challenge) {
    return (
      <section className="rounded-3xl border-[1.5px] border-line bg-surface p-6 text-center shadow-card">
        <p className="text-2xl">🗓️</p>
        <h2 className="mt-3 font-bold text-ink">El reto de esta semana llega el lunes</h2>
        <p className="mt-2 text-sm leading-snug text-muted">
          Mientras tanto, el mundo sigue ocurriendo ahí fuera.
        </p>
      </section>
    );
  }

  const done = participation?.status === 'approved';
  const pending = participation?.status === 'in_review' || participation?.status === 'evidence_pending';

  return (
    <section className="rounded-3xl border-[1.5px] border-line bg-surface p-6 shadow-card">
      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
        <span className="text-blue">Reto de la semana</span>
        <span className="text-muted"><Countdown endsAt={challenge.ends_at} /></span>
      </div>

      <div className="mt-5 flex items-start gap-4">
        <span className="text-4xl leading-none">{challenge.emoji ?? '⚡️'}</span>
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold leading-tight text-ink">{challenge.title}</h2>
          {challenge.description && (
            <p className="mt-1.5 text-sm leading-snug text-muted">{challenge.description}</p>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Tag>{difficultyLabel(challenge.difficulty)}</Tag>
        <Tag>+{challenge.reward_points} puntos</Tag>
        {challenge.participant_count > 0 && (
          <Tag>{challenge.participant_count} ya lo están viviendo</Tag>
        )}
      </div>

      <div className="mt-6">
        {done ? (
          <div className="rounded-2xl bg-ok-bg px-4 py-3.5 text-center text-sm font-bold text-ok">
            Vivido. Esta semana cuenta. ✓
          </div>
        ) : pending ? (
          <div className="rounded-2xl bg-blue-soft px-4 py-3.5 text-center text-sm font-bold text-blue">
            Validando tu experiencia…
          </div>
        ) : (
          <Button>Vivir el reto de esta semana</Button>
        )}
      </div>
    </section>
  );
}

function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-blue-soft px-3 py-1.5 text-xs font-bold text-blue">{children}</span>
  );
}

function difficultyLabel(d: 'easy' | 'medium' | 'hard') {
  return d === 'easy' ? 'Fácil' : d === 'medium' ? 'Reto' : 'Difícil';
}

/**
 * El feed. Bloqueado por defecto: la promesa central del producto.
 * Solo pedimos los datos si está desbloqueado — no gastamos red en lo que no se puede ver.
 */
function FeedSection({ unlocked }: { unlocked: boolean }) {
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['feed'],
    queryFn: fetchFeed,
    enabled: unlocked,
    staleTime: 60_000,
  });

  if (!unlocked) {
    return (
      <section className="mt-8">
        <div className="relative overflow-hidden rounded-3xl border-[1.5px] border-line bg-surface p-8 text-center">
          <div aria-hidden className="pointer-events-none absolute inset-0 grid grid-cols-2 gap-2 p-3 opacity-[0.18] blur-[6px]">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="h-24 rounded-2xl bg-gradient-to-br from-blue/50 to-ink/20" />
            ))}
          </div>
          <div className="relative">
            <p className="text-2xl">🔒</p>
            <h2 className="mt-3 text-lg font-extrabold text-ink">
              Hay gente viviendo cosas ahora mismo
            </h2>
            <p className="mx-auto mt-2 max-w-[280px] text-sm leading-snug text-muted">
              Vive tu reto de esta semana para ver lo que están haciendo.
              No recompensamos mirar. Recompensamos vivir.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-8">
      <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-muted">
        Lo que se está viviendo
      </h2>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }, (_, i) => (
            <div key={i} className="h-56 animate-pulse rounded-3xl bg-line" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <p className="rounded-3xl border-[1.5px] border-line bg-surface p-6 text-center text-sm text-muted">
          Todavía no hay experiencias publicadas. La primera puede ser la tuya.
        </p>
      ) : (
        <div className="space-y-4">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      )}
    </section>
  );
}

function PostCard({ post }: { post: FeedPost }) {
  const name = post.author?.display_name ?? post.author?.username ?? 'Alguien';
  return (
    <article className="overflow-hidden rounded-3xl border-[1.5px] border-line bg-surface shadow-card">
      {post.image_url && (
        <img
          src={post.image_url}
          alt={post.caption ?? `Experiencia de ${name}`}
          loading="lazy"
          className="h-56 w-full object-cover"
        />
      )}
      <div className="p-5">
        <div className="flex items-center gap-2 text-sm">
          <strong className="text-ink">{name}</strong>
          {post.city && <span className="text-muted">· {post.city}</span>}
        </div>
        {post.challenge && (
          <p className="mt-1 text-xs font-bold uppercase tracking-wider text-blue">
            {post.challenge.emoji} {post.challenge.title}
          </p>
        )}
        {post.caption && <p className="mt-2 text-sm leading-snug text-ink-soft">{post.caption}</p>}
      </div>
    </article>
  );
}

function HomeSkeleton() {
  return (
    <Screen>
      <div className="mb-7">
        <span className="block h-4 w-16 animate-pulse rounded bg-line" />
        <span className="mt-4 block h-7 w-48 animate-pulse rounded bg-line" />
        <span className="mt-2 block h-3 w-36 animate-pulse rounded bg-line" />
      </div>
      <div className="h-64 animate-pulse rounded-3xl bg-line" />
      <div className="mt-8 h-44 animate-pulse rounded-3xl bg-line" />
    </Screen>
  );
}
