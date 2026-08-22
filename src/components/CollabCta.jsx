import { Mail } from 'lucide-react';
import { motion as Motion } from 'motion/react';

export default function CollabCta({ onContactClick }) {
  return (
    <div className="border border-signal/60 bg-signal/5 rounded-lg px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        <p className="text-bone font-semibold text-base">Got an idea or need a developer?</p>
        <p className="text-muted text-sm mt-0.5">
          I'm open to freelance work, collaborations, and full-time opportunities.
        </p>
      </div>
      <Motion.button
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.15 }}
        onClick={onContactClick}
        className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-md bg-signal hover:bg-signal/90 text-ink font-bold text-sm transition-colors shadow-glow"
      >
        <Mail className="w-4 h-4" />
        Get in Touch
      </Motion.button>
    </div>
  );
}
