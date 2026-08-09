import { Code, Heart, Zap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 mt-8">
      <div className="max-w-screen-2xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
              <Code className="w-5 h-5 text-blue-400" />
              <span className="text-lg font-semibold text-slate-200">Developed by</span>
            </div>
            <a
              href="https://daryljohntadeo.space"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xl font-bold text-blue-400 mb-2 hover:text-blue-300 transition-colors inline-block"
            >
              Daryl John Tadeo
            </a>
            <p className="text-slate-400 text-sm">Full Stack Developer & UI/UX Enthusiast</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-pink-400" />
              <span className="text-lg font-semibold text-slate-200">Built with</span>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                React
              </span>
              <span className="bg-cyan-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                Tailwind CSS
              </span>
              <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                Lucide Icons
              </span>
              <span className="bg-yellow-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                Vite
              </span>
              <span className="bg-teal-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                Netlify
              </span>
            </div>
          </div>

          <div className="text-center md:text-right">
            <div className="flex items-center justify-center md:justify-end gap-2 mb-3">
              <Heart className="w-5 h-5 text-red-400" />
              <span className="text-lg font-semibold text-slate-200">Made with Care</span>
            </div>
            <p className="text-slate-400 text-sm mb-2">
              © {new Date().getFullYear()} Daryl John Tadeo
            </p>
            <p className="text-slate-500 text-xs">🔒 Your text never leaves your device, ever</p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-slate-400 text-sm">
              Free text & code diff checker — zero uploads, zero tracking, zero data leakage
            </div>
            <div className="text-slate-500 text-xs">Version 1.0 · Open Source</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
