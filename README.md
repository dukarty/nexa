# NEXA · App de producción (v2)

Stack: React 18 + TypeScript estricto + Vite + Tailwind + Supabase + TanStack Query + Framer Motion + Zod.

## Puesta en marcha (para desarrollo)

```bash
cd app
cp .env.example .env      # ya trae tu URL y clave pública de Supabase
npm install
npm run dev               # http://localhost:5173
```

Otros comandos:

```bash
npm run typecheck   # comprobación de tipos (estricta)
npm run build       # build de producción
npm run test        # tests unitarios (Vitest)
npm run test:e2e    # tests end-to-end (Playwright)
```

## Base de datos

El esquema de producción está en `../01-esquema-produccion.sql`. Se aplica en el
SQL Editor de Supabase (sustituye al esquema v1; seguro porque no hay usuarios reales).

## Estructura

- `src/app` — shell, providers, guards de sesión.
- `src/design` — tokens y componentes reutilizables.
- `src/features` — un módulo por dominio (auth, onboarding, home, challenges…).
- `src/lib` — cliente Supabase, query client, motion, utils.
- `src/types` — tipos del esquema.

## Estado

Bloque 1 (Fundamentos) implementado: config, tokens, cliente Supabase, tipos,
detección de estado de sesión y shell. Siguiente: Bloque 2 · Autenticación.
