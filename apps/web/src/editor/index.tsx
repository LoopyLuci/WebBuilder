'use client';

import React, { useState, useRef, useCallback, createContext, useContext, useEffect } from 'react';

// ─── Toast System ──────────────────────────────────────────────────────────

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  description?: string;
  duration?: number;
  action?: React.ReactNode;
}

type ToastListener = (toast: ToastItem) => void;
const listeners: ToastListener[] = [];

export function showToast(type: ToastItem['type'], message: string) {
  const toast: ToastItem = { id: Date.now().toString(36), type, description: message };
  listeners.forEach(fn => fn(toast));
}

export function useToastListener() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  React.useEffect(() => {
    const listener: ToastListener = (toast) => {
      setToasts(prev => [...prev, toast]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== toast.id)), toast.duration || 3000);
    };
    listeners.push(listener);
    return () => { const idx = listeners.indexOf(listener); if (idx >= 0) listeners.splice(idx, 1); };
  }, []);

  return toasts;
}

export function ToastContainer() {
  const toasts = useToastListener();
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
          <span className="flex-1">{toast.description}</span>
          <button onClick={() => {}} className="p-1 rounded hover:bg-white/20" aria-label="Dismiss">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Project Persistence ──────────────────────────────────────

export interface SavedProject {
  id: string;
  name: string;
  description: string;
  sections: Section[];
  viewport: 'desktop' | 'tablet' | 'mobile';
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'webbuilder-projects';

export function getSavedProjects(): SavedProject[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveProject(project: SavedProject): void {
  const projects = getSavedProjects();
  const existing = projects.findIndex(p => p.id === project.id);
  if (existing >= 0) {
    projects[existing] = { ...project, updatedAt: new Date().toISOString() };
  } else {
    projects.push(project);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function deleteProject(id: string): void {
  const projects = getSavedProjects().filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

// ─── Editor Types ───────────────────────────────────────────────────────────

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

// ─── Editor Context ─────────────────────────────────────────────────────────

interface EditorContextType {
  state: EditorState;
  isLoading: boolean;
  addSection: (component: string, name: string) => void;
  removeSection: (id: string) => void;
  updateSection: (id: string, updates: Partial<Section>) => void;
  selectSection: (id: string | null) => void;
  undo: () => void;
  redo: () => void;
  setViewport: (viewport: 'desktop' | 'tablet' | 'mobile') => void;
  setZoom: (zoom: number) => void;
  saveCurrentProject: (name: string, description: string) => void;
  loadProject: (project: SavedProject) => void;
  currentProjectId: string | null;
}

const EditorContext = createContext<EditorContextType | null>(null);

export function useEditorContext() {
  const context = useContext(EditorContext);
  if (!context) throw new Error('useEditorContext must be used within EditorProvider');
  return context;
}

// ─── Editor Provider ────────────────────────────────────────────────────────

interface EditorProviderProps {
  children: React.ReactNode;
  initialSections?: Section[];
}

export function EditorProvider({ children, initialSections = [] }: EditorProviderProps) {
  const [state, setState] = useState<EditorState>({
    sections: initialSections,
    selectedSectionId: null,
    viewport: 'desktop',
    zoom: 1,
    history: [initialSections],
    historyIndex: 0,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

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
      sections: prev.sections.map(s => s.id === id ? { ...s, ...updates } : s),
    }));
  }, []);

  const selectSection = useCallback((id: string | null) => {
    setState(prev => ({ ...prev, selectedSectionId: id }));
  }, []);

  const undo = useCallback(() => {
    setState(prev => {
      if (prev.historyIndex > 0) {
        return { ...prev, historyIndex: prev.historyIndex - 1, sections: prev.history[prev.historyIndex - 1] };
      }
      return prev;
    });
  }, []);

  const redo = useCallback(() => {
    setState(prev => {
      if (prev.historyIndex < prev.history.length - 1) {
        return { ...prev, historyIndex: prev.historyIndex + 1, sections: prev.history[prev.historyIndex + 1] };
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

  const saveCurrentProject = useCallback((name: string, description: string) => {
    const project: SavedProject = {
      id: currentProjectId || `project_${Date.now()}`,
      name,
      description,
      sections: state.sections,
      viewport: state.viewport,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveProject(project);
    setCurrentProjectId(project.id);
    showToast('success', `Project "${name}" saved`);
  }, [state.sections, state.viewport, currentProjectId]);

  const loadProject = useCallback((project: SavedProject) => {
    setState({
      sections: project.sections,
      selectedSectionId: null,
      viewport: project.viewport,
      zoom: 1,
      history: [project.sections],
      historyIndex: 0,
    });
    setCurrentProjectId(project.id);
    showToast('success', `Project "${project.name}" loaded`);
  }, []);

  return (
    <EditorContext.Provider value={{
      state, isLoading, addSection, removeSection, updateSection,
      selectSection, undo, redo, setViewport, setZoom,
      saveCurrentProject, loadProject, currentProjectId
    }}>
      {children}
    </EditorContext.Provider>
  );
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

export default { EditorProvider, useEditorContext, ToastContainer, showToast, getSavedProjects, deleteProject };
