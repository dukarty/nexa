import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button, Chip, FormError, Progress, Screen, StepHeader, TextField, Wordmark } from '@/design/ui';
import {
  ageFrom,
  basics,
  completeOnboarding,
  fetchFirstChallenge,
  fetchInterests,
  isUsernameFree,
  preferences,
  type Basics,
  type Interest,
  type Preferences,
} from './onboardingApi';

/**
 * Bloque 3 · Onboarding.
 * 5 pasos, uno por pantalla, sin scroll infinito ni formularios interminables.
 * Cada paso valida antes de dejar avanzar: nadie llega al final con datos rotos.
 * Al terminar: perfil + intereses normalizados guardados, y primer reto propuesto.
 */

const TOTAL = 5;

type Draft = Basics & Preferences;

const EMPTY: Draft = {
  display_name: '',
  username: '',
  city: '',
  birth_date: '',
  interestIds: [],
  looking_for: '',
  seeking_people: '',
  spontaneity: 50,
};

export function OnboardingFlow({ userId, onDone }: { userId: string; onDone: () => void }) {
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);

  const { data: interests = [], isLoading: loadingInterests } = useQuery({
    queryKey: ['interests'],
    queryFn: fetchInterests,
    staleTime: 1000 * 60 * 60,
  });

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => {
    setDraft((d) => ({ ...d, [k]: v }));
    setError(undefined);
  };

  const toggleInterest = (id: string) => {
    setError(undefined);
    setDraft((d) => ({
      ...d,
      interestIds: d.interestIds.includes(id)
        ? d.interestIds.filter((x) => x !== id)
        : [...d.interestIds, id],
    }));
  };

  const byCategory = useMemo(() => {
    const map: Record<string, Interest[]> = {};
    for (const i of interests) (map[i.category] ??= []).push(i);
    return map;
  }, [interests]);

  async function next() {
    setError(undefined);

    if (step === 2) {
      const parsed = basics.safeParse(draft);
      if (!parsed.success) return setError(parsed.error.issues[0]?.message);
      const free = await isUsernameFree(draft.username, userId);
      if (!free) return setError('Ese nombre de usuario ya está cogido. Prueba otro.');
    }

    if (step === 3 && draft.interestIds.length < 3) {
      return setError('Elige al menos 3. Así acertamos con lo que te proponemos.');
    }

    if (step === 4) {
      const parsed = preferences.safeParse(draft);
      if (!parsed.success) return setError(parsed.error.issues[0]?.message);
      setSaving(true);
      try {
        await completeOnboarding(userId, basics.parse(draft), preferences.parse(draft));
      } catch (e) {
        setSaving(false);
        return setError(e instanceof Error ? e.message : 'No se pudo guardar.');
      }
      setSaving(false);
    }

    setStep((s) => Math.min(s + 1, TOTAL));
  }

  const back = () => {
    setError(undefined);
    setStep((s) => Math.max(1, s - 1));
  };

  return (
    <Screen>
      {step > 1 && step < TOTAL && (
        <div className="mb-1 flex items-center gap-4">
          <button
            onClick={back}
            aria-label="Volver"
            className="-ml-1 text-2xl leading-none text-muted transition hover:text-ink"
          >
            ‹
          </button>
          <div className="flex-1">
            <Progress step={step} total={TOTAL - 1} />
          </div>
        </div>
      )}

      {step === 1 && <StepWelcome onNext={() => setStep(2)} />}

      {step === 2 && (
        <>
          <StepHeader
            title="Empecemos por ti"
            sub="Lo básico para que la gente sepa a quién está conociendo."
          />
          <TextField
            label="Tu nombre"
            placeholder="David"
            value={draft.display_name}
            onChange={(e) => set('display_name', e.target.value)}
            autoFocus
          />
          <TextField
            label="Nombre de usuario"
            placeholder="david"
            value={draft.username}
            onChange={(e) => set('username', e.target.value.toLowerCase().replace(/\s/g, ''))}
          />
          <TextField
            label="Ciudad"
            placeholder="Madrid"
            value={draft.city}
            onChange={(e) => set('city', e.target.value)}
          />
          <TextField
            label="Fecha de nacimiento"
            type="date"
            value={draft.birth_date}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => set('birth_date', e.target.value)}
          />
          <p className="mt-2 text-xs text-muted">
            Solo se usa para calcular tu edad. No podrás cambiarla después.
            {draft.birth_date && !Number.isNaN(Date.parse(draft.birth_date)) && (
              <> Tienes <strong className="text-ink">{ageFrom(draft.birth_date)}</strong> años.</>
            )}
          </p>
        </>
      )}

      {step === 3 && (
        <>
          <StepHeader
            title="¿Qué te mueve?"
            sub="Elige al menos 3. Con esto te proponemos retos y personas que encajan contigo."
          />
          {loadingInterests ? (
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 12 }, (_, i) => (
                <span key={i} className="h-10 w-24 animate-pulse rounded-full bg-line" />
              ))}
            </div>
          ) : (
            <div className="space-y-6 overflow-y-auto">
              {Object.entries(byCategory).map(([cat, list]) => (
                <section key={cat}>
                  <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted">
                    {cat === 'interes' ? 'Intereses' : cat === 'deporte' ? 'Deportes' : cat}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {list.map((i) => (
                      <Chip
                        key={i.id}
                        selected={draft.interestIds.includes(i.id)}
                        onClick={() => toggleInterest(i.id)}
                      >
                        {i.name}
                      </Chip>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
          <p className="mt-4 text-sm text-muted">
            {draft.interestIds.length} seleccionado{draft.interestIds.length === 1 ? '' : 's'}
          </p>
        </>
      )}

      {step === 4 && (
        <>
          <StepHeader
            title="¿Qué buscas en NEXA?"
            sub="No hay respuestas correctas. Esto solo nos ayuda a no proponerte lo que no quieres."
          />
          <TextField
            label="Qué quieres vivir"
            placeholder="Salir más, probar cosas nuevas…"
            value={draft.looking_for}
            onChange={(e) => set('looking_for', e.target.value)}
            autoFocus
          />
          <TextField
            label="A quién quieres conocer"
            placeholder="Gente que también quiera moverse"
            value={draft.seeking_people}
            onChange={(e) => set('seeking_people', e.target.value)}
          />

          <div className="mt-7">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted">
              Espontaneidad
            </span>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={draft.spontaneity}
              onChange={(e) => set('spontaneity', Number(e.target.value))}
              className="w-full accent-blue"
              aria-label="Nivel de espontaneidad"
            />
            <div className="mt-1 flex justify-between text-xs text-muted">
              <span>Lo planifico todo</span>
              <span className="font-bold text-ink">{spontaneityLabel(draft.spontaneity)}</span>
              <span>Me apunto a todo</span>
            </div>
          </div>
        </>
      )}

      {step === 5 && <StepDone onDone={onDone} name={draft.display_name} />}

      {step !== 5 && (
        <div className="mt-auto pt-8">
          <FormError>{error}</FormError>
          {step > 1 && (
            <Button onClick={next} loading={saving} disabled={step === 3 && draft.interestIds.length < 3}>
              {step === 4 ? 'Terminar' : 'Continuar'}
            </Button>
          )}
        </div>
      )}
    </Screen>
  );
}

function spontaneityLabel(v: number) {
  if (v <= 20) return 'Con plan';
  if (v <= 40) return 'Organizado';
  if (v <= 60) return 'Equilibrado';
  if (v <= 80) return 'Flexible';
  return 'Sin frenos';
}

/** Paso 1 · La promesa. Nadie rellena un formulario si no sabe para qué. */
function StepWelcome({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-1 flex-col justify-center text-center animate-fade">
      <Wordmark className="text-[34px]" />
      <h1 className="mt-10 text-[30px] font-extrabold leading-[1.15] tracking-tight text-ink">
        El mundo está ocurriendo
        <br />
        ahora mismo.
      </h1>
      <p className="mx-auto mt-4 max-w-[300px] text-[15px] leading-relaxed text-muted">
        NEXA no te da contenido que consumir. Te da algo que vivir.
        <br />
        <br />
        Dos minutos para conocerte y ya tendrás tu primer reto.
      </p>
      <div className="mt-auto pt-10">
        <Button onClick={onNext}>Empezar</Button>
      </div>
    </div>
  );
}

/** Paso 5 · Cierre: no felicitamos por rellenar un formulario, empujamos a salir. */
function StepDone({ name, onDone }: { name: string; onDone: () => void }) {
  const { data: challenge, isLoading } = useQuery({
    queryKey: ['first-challenge'],
    queryFn: fetchFirstChallenge,
  });

  return (
    <div className="flex flex-1 flex-col justify-center text-center animate-fade">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-blue text-3xl shadow-blue">
        🎯
      </div>
      <h1 className="mt-7 text-[28px] font-extrabold leading-tight tracking-tight text-ink">
        Listo{name ? `, ${name.split(' ')[0]}` : ''}.
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-muted">
        Tu año empieza aquí. Esto es lo primero que te toca vivir:
      </p>

      <div className="mt-7 rounded-2xl border-[1.5px] border-line bg-surface p-5 text-left">
        {isLoading ? (
          <>
            <span className="block h-4 w-2/3 animate-pulse rounded bg-line" />
            <span className="mt-3 block h-3 w-full animate-pulse rounded bg-line" />
          </>
        ) : challenge ? (
          <>
            <div className="flex items-start gap-3">
              <span className="text-2xl leading-none">{challenge.emoji ?? '⚡️'}</span>
              <div>
                <h2 className="font-bold text-ink">{challenge.title}</h2>
                {challenge.description && (
                  <p className="mt-1 text-sm leading-snug text-muted">{challenge.description}</p>
                )}
              </div>
            </div>
            {challenge.reward_points ? (
              <p className="mt-4 text-xs font-bold uppercase tracking-wider text-blue">
                +{challenge.reward_points} puntos
              </p>
            ) : null}
          </>
        ) : (
          <p className="text-sm leading-snug text-muted">
            El reto de esta semana se publica el lunes. Entra y prepárate.
          </p>
        )}
      </div>

      <div className="mt-auto pt-10">
        <Button onClick={onDone}>Entrar en NEXA</Button>
      </div>
    </div>
  );
}
