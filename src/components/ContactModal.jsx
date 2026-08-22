import { useState, useEffect, useCallback } from 'react';
import { X, Mail, User, MessageSquare, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { AnimatePresence, motion as Motion } from 'motion/react';
import { submitContactForm } from '../lib/contact';

export default function ContactModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle'); // 'idle' | 'sending' | 'success' | 'error'

  const handleClose = useCallback(() => {
    if (status === 'sending') return;
    onClose();
    setTimeout(() => {
      setFormData({ name: '', email: '', message: '' });
      setStatus('idle');
    }, 300);
  }, [status, onClose]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, handleClose]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const success = await submitContactForm(formData);
      setStatus(success ? 'success' : 'error');
    } catch {
      setStatus('error');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <Motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="bg-ink border border-inkborder rounded-lg w-full max-w-md"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-inkborder">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-signal" />
                <h2 className="text-lg font-bold font-heading text-bone">Get in Touch</h2>
              </div>
              <button
                onClick={handleClose}
                className="text-muted hover:text-bone transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              {status === 'success' ? (
                <div className="flex flex-col items-center gap-3 py-6 text-center">
                  <CheckCircle className="w-12 h-12 text-signal" />
                  <h3 className="text-lg font-bold text-bone">Message Sent!</h3>
                  <p className="text-muted text-sm">
                    Thanks for reaching out. I'll get back to you soon.
                  </p>
                  <button
                    onClick={handleClose}
                    className="mt-2 px-6 py-2 bg-signal hover:bg-signal/90 text-ink rounded-md font-semibold text-sm transition-colors"
                  >
                    Close
                  </button>
                </div>
              ) : status === 'error' ? (
                <div className="flex flex-col items-center gap-3 py-6 text-center">
                  <AlertCircle className="w-12 h-12 text-red-400" />
                  <h3 className="text-lg font-bold text-bone">Something went wrong</h3>
                  <p className="text-muted text-sm">
                    Please try again or email me directly at daryltadss.workemail@gmail.com
                  </p>
                  <button
                    onClick={() => setStatus('idle')}
                    className="mt-2 px-6 py-2 border border-inkborder hover:border-bone/40 text-bone rounded-md font-semibold text-sm transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-bone/80 mb-1.5">
                      <User className="w-3.5 h-3.5 inline mr-1.5" />
                      Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                      placeholder="Your name"
                      className="w-full bg-transparent border border-inkborder rounded-md px-3 py-2.5 text-sm text-bone placeholder:text-muted/60 focus:outline-none focus:border-signal transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-bone/80 mb-1.5">
                      <Mail className="w-3.5 h-3.5 inline mr-1.5" />
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                      placeholder="your@email.com"
                      className="w-full bg-transparent border border-inkborder rounded-md px-3 py-2.5 text-sm text-bone placeholder:text-muted/60 focus:outline-none focus:border-signal transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-bone/80 mb-1.5">
                      <MessageSquare className="w-3.5 h-3.5 inline mr-1.5" />
                      Message
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
                      placeholder="What's on your mind?"
                      className="w-full bg-transparent border border-inkborder rounded-md px-3 py-2.5 text-sm text-bone placeholder:text-muted/60 focus:outline-none focus:border-signal transition-colors resize-none"
                    />
                  </div>
                  <Motion.button
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={status === 'sending'}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-signal hover:bg-signal/90 disabled:bg-inkborder disabled:text-muted text-ink rounded-md font-semibold text-sm transition-colors"
                  >
                    {status === 'sending' ? (
                      'Sending…'
                    ) : (
                      <>
                        <Send className="w-4 h-4" /> Send Message
                      </>
                    )}
                  </Motion.button>
                </form>
              )}
            </div>
          </Motion.div>
        </Motion.div>
      )}
    </AnimatePresence>
  );
}
