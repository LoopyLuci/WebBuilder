'use client';

import React, { createContext, useContext, useCallback, useState, useEffect, forwardRef } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  description?: string;
  duration?: number;
  action?: React.ReactNode;
}

interface ToastContextValue {
  toast: (options: Omit<ToastItem, 'id'>) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};

const toastIcons: Record<ToastType, React.ReactNode> = {
  success: (
    <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  ),
  error: (
    <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
  ),
  warning: (
    <svg className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  ),
  info: (
    <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
  ),
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback((options: Omit<ToastItem, 'id'>) => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { ...options, id }]);
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div aria-live="polite" aria-label="Notifications" className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map(t => (
          <ToastMessage key={t.id} {...t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const ToastMessage = ({ type, title, description, duration = 5000, action, onDismiss }: ToastItem & { onDismiss: () => void }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (duration === 0) return;
    const exitTimer = setTimeout(() => setIsExiting(true), duration - 200);
    const removeTimer = setTimeout(onDismiss, duration);
    return () => { clearTimeout(exitTimer); clearTimeout(removeTimer); };
  }, [duration, onDismiss]);

  return (
    <div
      role="alert"
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      className={`flex items-start gap-3 rounded-lg border bg-background p-4 shadow-lg min-w-[320px] max-w-md animate-slide-up ${
        isExiting ? 'opacity-0 translate-x-full transition-all duration-200' : ''
      } ${type === 'success' ? 'border-green-500/30' : type === 'error' ? 'border-red-500/30' : type === 'warning' ? 'border-yellow-500/30' : 'border-blue-500/30'}`}
    >
      {toastIcons[type]}
      <div className="flex-1">
        {title && <p className="text-sm font-medium">{title}</p>}
        {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
        {action && <div className="mt-2">{action}</div>}
      </div>
      <button onClick={onDismiss} className="shrink-0 rounded-md p-1 text-muted-foreground hover:text-foreground" aria-label="Dismiss">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export const Toast = forwardRef<HTMLDivElement, ToastItem & { className?: string }>(
  ({ className, type, title, description, action }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={`flex items-start gap-3 rounded-lg border bg-background p-4 shadow-lg animate-slide-up ${
        type === 'success' ? 'border-green-500/30' : type === 'error' ? 'border-red-500/30' : type === 'warning' ? 'border-yellow-500/30' : 'border-blue-500/30'
      } ${className}`}
    >
      {toastIcons[type]}
      <div className="flex-1">
        {title && <p className="text-sm font-medium">{title}</p>}
        {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
        {action && <div className="mt-2">{action}</div>}
      </div>
    </div>
  )
);

Toast.displayName = 'Toast';
