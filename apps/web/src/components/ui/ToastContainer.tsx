'use client';

import { useState, useCallback, useEffect } from 'react';
import { ToastItem } from '@/components/ui/Toast';

// ─── Toast Function ────────────────────────────────────────────────────────

export function showToast(type: 'success' | 'error' | 'info' | 'warning', message: string) {
  const event = new CustomEvent('webbuilder-toast', { detail: { type, message } });
  window.dispatchEvent(event);
}

// ─── Toast Container ───────────────────────────────────────────────────────

export function ToastContainer() {
  const [toasts, setToasts] = useState<(ToastItem & { message: string})[]>([]);

  useEffect(() => {
    const listener = (e: Event) => {
      const { type, message } = (e as CustomEvent).detail;
      const id = Date.now().toString(36);
      setToasts(prev => [...prev, { id, type, description: message } as any]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 3000);
    };
    window.addEventListener('webbuilder-toast', listener);
    return () => window.removeEventListener('webbuilder-toast', listener);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2" aria-live="polite" aria-label="Notifications">
      {toasts.map(toast => (
        <div
          key={toast.id}
          role="alert"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-slide-up ${
            toast.type === 'success' ? 'bg-green-500 text-white' :
            toast.type === 'error' ? 'bg-red-500 text-white' :
            toast.type === 'warning' ? 'bg-yellow-500 text-white' :
            'bg-blue-500 text-white'
          }`}
        >
          <span className="flex-1">{toast.description}</span>
          <button
            onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
            className="p-1 rounded hover:bg-white/20"
            aria-label="Dismiss"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
