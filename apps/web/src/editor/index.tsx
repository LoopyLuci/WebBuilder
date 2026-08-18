// ============================================================================
// Visual Editor — Main Entry Point
// Browser-based drag-and-drop web page builder
// ============================================================================

import React, { useState, useCallback, useRef, createContext, useContext } from 'react';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface EditorState {
  spec: any;
  selectedSectionId: string | null;
  hoveredSectionId: string | null;
  viewport: 'desktop' | 'tablet' | 'mobile';
  zoom: number;
  history: any[][];
  historyIndex: number;
}

export interface EditorContextType {
  state: EditorState;
  setState: React.Dispatch<React.SetStateAction<EditorState>>;
  selectSection: (id: string | null) => void;
  updateSection: (id: string, updates: any) => void;
  addSection: (pageId: string, section: any) => void;
  removeSection: (id: string) => void;
  moveSection: (fromIndex: number, toIndex: number) => void;
  undo: () => void;
  redo: () => void;
}

export const EditorContext = createContext<EditorContextType>(null!);

export function useEditor() {
  return useContext(EditorContext);
}

// ─── Editor Provider ────────────────────────────────────────────────────────

interface EditorProviderProps {
  children: React.ReactNode;
  initialSpec: any;
}

export function EditorProvider({ children, initialSpec }: EditorProviderProps) {
  const [state, setState] = useState<EditorState>({
    spec: initialSpec,
    selectedSectionId: null,
    hoveredSectionId: null,
    viewport: 'desktop',
    zoom: 1,
    history: [initialSpec],
    historyIndex: 0,
  });

  const selectSection = useCallback((id: string | null) => {
    setState(s => ({ ...s, selectedSectionId: id }));
  }, []);

  const updateSection = useCallback((id: string, updates: any) => {
    setState(s => {
      const newSpec = { ...s.spec };
      // Find and update the section
      for (const page of newSpec.structure.pages) {
        for (let i = 0; i < page.sections.length; i++) {
          if (page.sections[i].id === id) {
            page.sections[i] = { ...page.sections[i], ...updates };
            break;
          }
        }
      }
      return { ...s, spec: newSpec };
    });
  }, []);

  const addSection = useCallback((pageId: string, section: any) => {
    setState(s => {
      const newSpec = { ...s.spec };
      const page = newSpec.structure.pages.find((p: any) => p.id === pageId);
      if (page) {
        page.sections.push(section);
      }
      return { ...s, spec: newSpec };
    });
  }, []);

  const removeSection = useCallback((id: string) => {
    setState(s => {
      const newSpec = { ...s.spec };
      for (const page of newSpec.structure.pages) {
        page.sections = page.sections.filter((sec: any) => sec.id !== id);
      }
      return { ...s, spec: newSpec, selectedSectionId: null };
    });
  }, []);

  const moveSection = useCallback((fromIndex: number, toIndex: number) => {
    setState(s => {
      const newSpec = { ...s.spec };
      for (const page of newSpec.structure.pages) {
        const [moved] = page.sections.splice(fromIndex, 1);
        if (moved) page.sections.splice(toIndex, 0, moved);
      }
      return { ...s, spec: newSpec };
    });
  }, []);

  const undo = useCallback(() => {
    setState(s => {
      if (s.historyIndex > 0) {
        return { ...s, historyIndex: s.historyIndex - 1, spec: s.history[s.historyIndex - 1] };
      }
      return s;
    });
  }, []);

  const redo = useCallback(() => {
    setState(s => {
      if (s.historyIndex < s.history.length - 1) {
        return { ...s, historyIndex: s.historyIndex + 1, spec: s.history[s.historyIndex + 1] };
      }
      return s;
    });
  }, []);

  return (
    <EditorContext.Provider value={{
      state, setState, selectSection, updateSection,
      addSection, removeSection, moveSection, undo, redo
    }}>
      {children}
    </EditorContext.Provider>
  );
}

export default EditorProvider;
