import { Mail } from 'lucide-react';

export default function CollabCta({ onContactClick }) {
  return (
    <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-900/30 to-pink-900/20 px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        <p className="text-white font-semibold text-base">👋 Got an idea or need a developer?</p>
        <p className="text-slate-400 text-sm mt-0.5">
          I'm open to freelance work, collaborations, and full-time opportunities.
        </p>
      </div>
      <button
        onClick={onContactClick}
        className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-sm shadow-lg shadow-purple-900/40 transition-all"
      >
        <Mail className="w-4 h-4" />
        Get in Touch
      </button>
    </div>
  );
}
