import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';

/** Sistema de diseño NEXA · componentes reutilizables (no duplicar estilos por pantalla). */

export function Screen({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`flex-1 flex flex-col px-6 pb-28 pt-7 animate-fade ${className}`}>{children}</div>;
}

export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <div className={`font-extrabold tracking-[4px] ${className}`}>
      NE<span className="text-blue">X</span>A
    </div>
  );
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'line';
  loading?: boolean;
};
export function Button({ variant = 'primary', loading, children, disabled, className = '', ...rest }: BtnProps) {
  const base = 'w-full rounded-2xl py-4 font-bold text-base transition active:scale-[.985] disabled:opacity-50 disabled:cursor-default';
  const styles = {
    primary: 'bg-gradient-to-b from-blue to-blue-dark text-white shadow-blue disabled:shadow-none disabled:bg-none disabled:bg-[#e7e9ee] disabled:text-[#aeb4be]',
    ghost: 'bg-transparent text-blue',
    line: 'bg-surface border-[1.5px] border-line text-ink',
  }[variant];
  return (
    <button className={`${base} ${styles} ${className}`} disabled={disabled || loading} {...rest}>
      {loading ? <span className="inline-block h-[18px] w-[18px] animate-spin rounded-full border-2 border-white/40 border-t-white align-[-3px]" /> : children}
    </button>
  );
}

export const TextField = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { label?: string }>(
  ({ label, className = '', ...rest }, ref) => (
    <label className="block">
      {label && <span className="mb-2 mt-4 block text-xs font-bold uppercase tracking-wider text-muted">{label}</span>}
      <input
        ref={ref}
        className={`w-full rounded-[15px] border-[1.5px] border-line bg-surface p-4 text-base text-ink outline-none focus:border-blue ${className}`}
        {...rest}
      />
    </label>
  ),
);
TextField.displayName = 'TextField';

export function FormError({ children }: { children?: ReactNode }) {
  return <p role="alert" className="mt-3 min-h-[18px] text-center text-sm text-[#d33]">{children}</p>;
}

/** Píldora seleccionable (intereses, deportes…). */
export function Chip({
  selected,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={`rounded-full border-[1.5px] px-4 py-2.5 text-sm font-semibold transition active:scale-[.97] ${
        selected
          ? 'border-blue bg-blue text-white shadow-blue'
          : 'border-line bg-surface text-ink hover:border-blue/40'
      }`}
      {...rest}
    >
      {children}
    </button>
  );
}

/** Barra de progreso por pasos del onboarding. */
export function Progress({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex gap-1.5" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={total}>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i < step ? 'bg-blue' : 'bg-line'}`}
        />
      ))}
    </div>
  );
}

/** Cabecera de paso: titular grande + subtítulo. Mantiene el ritmo visual entre pantallas. */
export function StepHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <header className="mb-6 mt-8">
      <h1 className="text-[26px] font-extrabold leading-tight tracking-tight text-ink">{title}</h1>
      {sub && <p className="mt-2 text-[15px] leading-snug text-muted">{sub}</p>}
    </header>
  );
}
