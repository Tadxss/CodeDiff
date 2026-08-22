import { motion as Motion, useReducedMotion } from 'motion/react';

export default function Reveal({ children, delay = 0, className = '' }) {
  const reduceMotion = useReducedMotion();

  return (
    <Motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
    >
      {children}
    </Motion.div>
  );
}
