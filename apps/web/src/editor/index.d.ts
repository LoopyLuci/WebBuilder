import React from 'react';
export interface ToastItem {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title?: string;
    description?: string;
    duration?: number;
    action?: React.ReactNode;
}
export declare function showToast(type: ToastItem['type'], message: string): void;
export declare function useToastListener(): ToastItem[];
export declare function ToastContainer(): React.JSX.Element;
export interface SavedProject {
    id: string;
    name: string;
    description: string;
    sections: Section[];
    viewport: 'desktop' | 'tablet' | 'mobile';
    createdAt: string;
    updatedAt: string;
}
export declare function getSavedProjects(): SavedProject[];
export declare function saveProject(project: SavedProject): void;
export declare function deleteProject(id: string): void;
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
export declare function useEditorContext(): EditorContextType;
interface EditorProviderProps {
    children: React.ReactNode;
    initialSections?: Section[];
}
export declare function EditorProvider({ children, initialSections }: EditorProviderProps): React.JSX.Element;
declare const _default: {
    EditorProvider: typeof EditorProvider;
    useEditorContext: typeof useEditorContext;
    ToastContainer: typeof ToastContainer;
    showToast: typeof showToast;
    getSavedProjects: typeof getSavedProjects;
    deleteProject: typeof deleteProject;
};
export default _default;
//# sourceMappingURL=index.d.ts.map