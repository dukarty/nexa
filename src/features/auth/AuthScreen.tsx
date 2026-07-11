import { useState } from 'react';
import { motion } from 'framer-motion';
import { Screen, Wordmark, Button, TextField, FormError } from '@/design/ui';
import { fadeUp } from '@/lib/motion';
import { credentials, signUp, signIn } from './authApi';

type Mode = 'welcome' | 'signup' | 'login';

export function AuthScreen() {
  const [mode, setMode] = useState<Mode>('welcome');

  if (mode === 'welcome') {
    return (
      <Screen className="items-center justify-center text-center">
        <motion.div variants={fadeUp} initial="hidden" animate="show">
          <Wordmark className="text-[40px]" />
          <p className="mt-4 text-[17px] font-medium leading-snug text-ink">
            No recompensamos mirar.
            <br />
            Recompensamos vivir.
          </p>
          <p className="mt-3 text-sm text-muted-2">
            Abre NEXA y en menos de 60 segundos sabes qué hacer fuera de ella.
          </p>
        </motion.div>
        <div className="mt-10 w-full">
          <Button onClick={() => setMode('signup')}>Crear cuenta</Button>
          <Button variant="ghost" className="mt-3" onClick={() => setMode('login')}>
            Ya tengo cuenta
          </Button>
        </div>
      </Screen>
    );
  }

  return <AuthForm mode={mode} onSwitch={setMode} />;
}

function AuthForm({ mode, onSwitch }: { mode: 'signup' | 'login'; onSwitch: (m: Mode) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string>();
  const isSignup = mode === 'signup';

  async function submit() {
    setError(undefined);
    const parsed = credentials.safeParse({ email, password });
    if (!parsed.success) return setError(parsed.error.issues[0]?.message);
    setLoading(true);
    try {
      if (isSignup) {
        await signUp(parsed.data);
        setNotice('Cuenta creada. Entrando…');
      } else {
        await signIn(parsed.data);
      }
      // El cambio de estado de sesión lo detecta useSession y navega solo.
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error inesperado.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <button className="mb-5 self-start text-blue" onClick={() => onSwitch('welcome')}>‹ Atrás</button>
      <Wordmark className="text-[22px]" />
      <h1 className="mt-8 text-[38px] font-extrabold leading-[1.05] tracking-tight">
        {isSignup ? <>Crea tu<br />cuenta.</> : <>Bienvenido<br />de vuelta.</>}
      </h1>

      <TextField
        label="Correo electrónico"
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="tu@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        label="Contraseña"
        type="password"
        autoComplete={isSignup ? 'new-password' : 'current-password'}
        placeholder={isSignup ? 'Mínimo 6 caracteres' : 'Tu contraseña'}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
      />

      <FormError>{error}</FormError>
      {notice && <p className="text-center text-sm text-ok">{notice}</p>}

      <Button className="mt-4" loading={loading} onClick={submit}>
        {isSignup ? 'Crear cuenta' : 'Entrar'}
      </Button>

      <p className="mt-6 text-center text-sm text-muted">
        {isSignup ? '¿Ya tienes cuenta? ' : '¿No tienes cuenta? '}
        <button className="font-bold text-blue" onClick={() => onSwitch(isSignup ? 'login' : 'signup')}>
          {isSignup ? 'Iniciar sesión' : 'Crear cuenta'}
        </button>
      </p>
    </Screen>
  );
}
