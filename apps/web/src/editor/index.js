'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useCallback, createContext, useContext } from 'react';
const listeners = [];
export function showToast(type, message) {
    const toast = { id: Date.now().toString(36), type, description: message };
    listeners.forEach(fn => fn(toast));
}
export function useToastListener() {
    const [toasts, setToasts] = useState([]);
    React.useEffect(() => {
        const listener = (toast) => {
            setToasts(prev => [...prev, toast]);
            setTimeout(() => setToasts(prev => prev.filter(t => t.id !== toast.id)), toast.duration || 3000);
        };
        listeners.push(listener);
        return () => { const idx = listeners.indexOf(listener); if (idx >= 0)
            listeners.splice(idx, 1); };
    }, []);
    return toasts;
}
export function ToastContainer() {
    const toasts = useToastListener();
    return (_jsx("div", { className: "fixed bottom-4 right-4 z-[100] flex flex-col gap-2", "aria-live": "polite", "aria-label": "Notifications", children: toasts.map(toast => (_jsxs("div", { role: "alert", className: `flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-slide-up min-w-[280px] ${toast.type === 'success' ? 'bg-green-500 text-white' :
                toast.type === 'error' ? 'bg-red-500 text-white' :
                    toast.type === 'warning' ? 'bg-yellow-500 text-white' :
                        'bg-blue-500 text-white'}`, children: [_jsx("span", { className: "flex-1", children: toast.description }), _jsx("button", { onClick: () => { }, className: "p-1 rounded hover:bg-white/20", "aria-label": "Dismiss", children: _jsx("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) })] }, toast.id))) }));
}
const STORAGE_KEY = 'webbuilder-projects';
export function getSavedProjects() {
    if (typeof window === 'undefined')
        return [];
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    }
    catch {
        return [];
    }
}
export function saveProject(project) {
    const projects = getSavedProjects();
    const existing = projects.findIndex(p => p.id === project.id);
    if (existing >= 0) {
        projects[existing] = { ...project, updatedAt: new Date().toISOString() };
    }
    else {
        projects.push(project);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}
export function deleteProject(id) {
    const projects = getSavedProjects().filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}
const EditorContext = createContext(null);
export function useEditorContext() {
    const context = useContext(EditorContext);
    if (!context)
        throw new Error('useEditorContext must be used within EditorProvider');
    return context;
}
export function EditorProvider({ children, initialSections = [] }) {
    const [state, setState] = useState({
        sections: initialSections,
        selectedSectionId: null,
        viewport: 'desktop',
        zoom: 1,
        history: [initialSections],
        historyIndex: 0,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [currentProjectId, setCurrentProjectId] = useState(null);
    const addSection = useCallback((component, name) => {
        setIsLoading(true);
        setTimeout(() => {
            const newSection = {
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
    const removeSection = useCallback((id) => {
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
    const updateSection = useCallback((id, updates) => {
        setState(prev => ({
            ...prev,
            sections: prev.sections.map(s => s.id === id ? { ...s, ...updates } : s),
        }));
    }, []);
    const selectSection = useCallback((id) => {
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
    const setViewport = useCallback((viewport) => {
        setState(prev => ({ ...prev, viewport }));
    }, []);
    const setZoom = useCallback((zoom) => {
        setState(prev => ({ ...prev, zoom: Math.max(0.5, Math.min(2, zoom)) }));
    }, []);
    const saveCurrentProject = useCallback((name, description) => {
        const project = {
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
    const loadProject = useCallback((project) => {
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
    return (_jsx(EditorContext.Provider, { value: {
            state, isLoading, addSection, removeSection, updateSection,
            selectSection, undo, redo, setViewport, setZoom,
            saveCurrentProject, loadProject, currentProjectId
        }, children: children }));
}
function getDefaultProps(component) {
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
//# sourceMappingURL=index.js.map