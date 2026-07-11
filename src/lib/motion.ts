import type { Variants, Transition } from 'framer-motion';

/** Sistema de motion centralizado. Coherente, sobrio, sin rebotes infantiles. */
export const ease: Transition['ease'] = [0.22, 1, 0.36, 1];

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease } },
};

export const routeTransition: Variants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.28, ease } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.18, ease } },
};

export const sheet: Variants = {
  hidden: { y: '100%' },
  show: { y: 0, transition: { duration: 0.3, ease } },
  exit: { y: '100%', transition: { duration: 0.22, ease } },
};
