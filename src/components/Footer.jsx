import { Code, Heart, Lock, Zap } from 'lucide-react';
import { motion as Motion } from 'motion/react';

export default function Footer() {
  return (
    <footer className="bg-ink border-t border-inkborder mt-8">
      <div className="max-w-screen-2xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
              <Code className="w-5 h-5 text-signal" />
              <span className="text-lg font-semibold font-heading text-bone">Developed by</span>
            </div>
            <a
              href="https://daryljohntadeo.space"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xl font-bold text-signal mb-2 hover:text-signal/80 transition-colors inline-block"
            >
              Daryl John Tadeo
            </a>
            <p className="text-muted text-sm">Software Engineer & AI Enthusiast</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-signal" />
              <span className="text-lg font-semibold font-heading text-bone">Built with</span>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {['React', 'Tailwind CSS', 'Lucide Icons', 'Vite', 'Netlify'].map((tech) => (
                <Motion.span
                  key={tech}
                  whileHover={{ scale: 1.05, y: -1 }}
                  transition={{ duration: 0.15 }}
                  className="border border-inkborder text-muted hover:border-signal/50 hover:text-signal px-3 py-1 rounded-md text-sm font-medium transition-colors"
                >
                  {tech}
                </Motion.span>
              ))}
            </div>
          </div>

          <div className="text-center md:text-right">
            <div className="flex items-center justify-center md:justify-end gap-2 mb-3">
              <Heart className="w-5 h-5 text-signal" />
              <span className="text-lg font-semibold font-heading text-bone">Made with Care</span>
            </div>
            <p className="text-muted text-sm mb-2">
              © {new Date().getFullYear()} Daryl John Tadeo
            </p>
            <p className="text-muted text-xs flex items-center justify-center md:justify-end gap-1.5">
              <Lock className="w-3 h-3" /> Your text never leaves your device, ever
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-inkborder">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-muted text-sm">
              Free text & code diff checker — zero uploads, zero tracking, zero data leakage
            </div>
            <div className="text-muted text-xs">Version 1.0 · Open Source</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
