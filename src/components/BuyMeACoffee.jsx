import { Coffee } from 'lucide-react';
import { motion as Motion } from 'motion/react';

export default function BuyMeACoffee() {
  return (
    <div className="mt-4 flex items-center justify-center gap-3 py-4 text-muted text-sm">
      <span>Found this useful? Support the work —</span>
      <Motion.a
        whileHover={{ y: -1 }}
        href="https://coff.ee/daryltadss8"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-muted hover:text-signal transition-colors font-medium"
      >
        <Coffee className="w-4 h-4" />
        <span>Buy me a coffee</span>
      </Motion.a>
    </div>
  );
}
