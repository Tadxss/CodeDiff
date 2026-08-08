import { GitCompare } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-10">
      <div className="max-w-screen-2xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GitCompare className="w-7 h-7 text-blue-400" />
          <div className="text-left">
            <h1 className="text-xl font-bold text-white leading-tight">CodeDiff</h1>
            <p className="text-xs text-slate-400">
              Compare text instantly — nothing leaves your browser
            </p>
          </div>
        </div>
        <span className="hidden sm:block text-xs text-slate-500 bg-slate-800 px-3 py-1 rounded-full">
          🔒 100% private · runs locally
        </span>
      </div>
    </header>
  );
}
