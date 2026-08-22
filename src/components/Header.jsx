import { GitCompare, Lock } from 'lucide-react';
import { motion as Motion } from 'motion/react';

export default function Header() {
  return (
    <header className="bg-ink/95 backdrop-blur-md border-b border-inkborder sticky top-0 z-10">
      <div className="max-w-screen-2xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Motion.div
            whileHover={{ rotate: -8, scale: 1.06 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          >
            <GitCompare className="w-7 h-7 text-signal" />
          </Motion.div>
          <div className="text-left font-heading">
            <h1 className="text-xl font-bold text-bone leading-tight">CodeDiff</h1>
            <p className="text-xs text-muted font-body">
              Compare text instantly — nothing leaves your browser
            </p>
          </div>
        </div>
        <span className="hidden sm:flex items-center gap-1.5 text-xs text-signal bg-signal/5 border border-signal/40 px-3 py-1 rounded-md">
          <Lock className="w-3 h-3" /> 100% private · runs locally
        </span>
      </div>
    </header>
  );
}
