'use client';

import { useState, useCallback, useEffect } from 'react';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface Section {
  id: string;
  component: string;
  name: string;
  props: Record<string, any>;
}

export interface EditorState {
  sections: Section[];
  selectedSectionId: string | null;
  viewport: 'desktop' | 'tablet' | 'mobile';
  zoom: number;
  history: Section[][];
  historyIndex: number;
}

// ─── Toast Event System ────────────────────────────────────────────────────

type ToastType = 'success' | 'error' | 'info' | 'warning';
type ToastListener = (type: ToastType, message: string) => void;

const toastListeners: ToastListener[] = [];

export function showToast(type: ToastType, message: string) {
  toastListeners.forEach(fn => fn(type, message));
}

export function useToastListener() {
  const [toasts, setToasts] = useState<Array<{ id: string; type: ToastType; message: string }>>([]);

  useEffect(() => {
    const listener: ToastListener = (type, message) => {
      const id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
      setToasts(prev => [...prev, { id, type, message }]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 3000);
    };
    toastListeners.push(listener);
    return () => {
      const idx = toastListeners.indexOf(listener);
      if (idx >= 0) toastListeners.splice(idx, 1);
    };
  }, []);

  return toasts;
}

export function ToastContainer() {
  const toasts = useToastListener();

  const removeToast = (id: string) => {
    // Toasts auto-dismiss after timeout
  };

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2" aria-live="polite" aria-label="Notifications">
      {toasts.map(toast => (
        <div
          key={toast.id}
          role="alert"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-slide-up min-w-[280px] ${
            toast.type === 'success' ? 'bg-green-500 text-white' :
            toast.type === 'error' ? 'bg-red-500 text-white' :
            toast.type === 'warning' ? 'bg-yellow-500 text-white' :
            'bg-blue-500 text-white'
          }`}
        >
          <span className="flex-1">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
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

// ─── Editor Hook ────────────────────────────────────────────────────────────

export function useEditor(initialSections: Section[] = []) {
  const [state, setState] = useState<EditorState>({
    sections: initialSections,
    selectedSectionId: null,
    viewport: 'desktop',
    zoom: 1,
    history: [initialSections],
    historyIndex: 0,
  });

  const [isLoading, setIsLoading] = useState(false);

  const addSection = useCallback((component: string, name: string) => {
    setIsLoading(true);
    setTimeout(() => {
      const newSection: Section = {
        id: `section_${Date.now()}`,
        component,
        name,
        props: getDefaultProps(component),
      };
      setState(prev => ({
        ...prev,
        sections: [...prev.sections, newSection],
        selectedSectionId: newSection.id,
        history: [...prev.history.slice(0, prev.historyIndex + 1), [...prev.sections, newSection]],
        historyIndex: prev.historyIndex + 1,
      }));
      setIsLoading(false);
      showToast('success', `${name} added`);
    }, 300);
  }, []);

  const removeSection = useCallback((id: string) => {
    setState(prev => {
      const newSections = prev.sections.filter(s => s.id !== id);
      return {
        ...prev,
        sections: newSections,
        selectedSectionId: null,
        history: [...prev.history.slice(0, prev.historyIndex + 1), newSections],
        historyIndex: prev.historyIndex + 1,
      };
    });
    showToast('info', 'Section removed');
  }, []);

  const updateSection = useCallback((id: string, updates: Partial<Section>) => {
    setState(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === id ? { ...s, ...updates } : s
      ),
    }));
  }, []);

  const selectSection = useCallback((id: string | null) => {
    setState(prev => ({ ...prev, selectedSectionId: id }));
  }, []);

  const undo = useCallback(() => {
    setState(prev => {
      if (prev.historyIndex > 0) {
        return {
          ...prev,
          historyIndex: prev.historyIndex - 1,
          sections: prev.history[prev.historyIndex - 1],
        };
      }
      return prev;
    });
  }, []);

  const redo = useCallback(() => {
    setState(prev => {
      if (prev.historyIndex < prev.history.length - 1) {
        return {
          ...prev,
          historyIndex: prev.historyIndex + 1,
          sections: prev.history[prev.historyIndex + 1],
        };
      }
      return prev;
    });
  }, []);

  const setViewport = useCallback((viewport: 'desktop' | 'tablet' | 'mobile') => {
    setState(prev => ({ ...prev, viewport }));
  }, []);

  const setZoom = useCallback((zoom: number) => {
    setState(prev => ({ ...prev, zoom: Math.max(0.5, Math.min(2, zoom)) }));
  }, []);

  return {
    state,
    isLoading,
    addSection,
    removeSection,
    updateSection,
    selectSection,
    undo,
    redo,
    setViewport,
    setZoom,
  };
}

function getDefaultProps(component: string): Record<string, any> {
  switch (component) {
    case 'hero':
      return { title: 'Welcome to Your App', subtitle: 'Build something amazing', ctaText: 'Get Started', ctaLink: '#' };
    case 'features':
      return { title: 'Features', subtitle: 'Everything you need', columns: 3 };
    case 'pricing':
      return { title: 'Pricing', subtitle: 'Choose your plan', tiers: 3 };
    case 'cta':
      return { title: 'Ready to get started?', buttonText: 'Sign Up Now', buttonLink: '#' };
    case 'stats':
      return { title: 'Our Impact' };
    case 'testimonials':
      return { title: 'What Users Say' };
    default:
      return {};
  }
}

export default { useEditor, showToast };
