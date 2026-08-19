'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { getSavedProjects, deleteProject } from '@/editor';
export function ProjectManager({ onLoad, onNew, isOpen, onClose }) {
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const loadProjects = () => {
        setIsLoading(true);
        setProjects(getSavedProjects());
        setIsLoading(false);
    };
    React.useEffect(() => {
        if (isOpen)
            loadProjects();
    }, [isOpen]);
    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this project?')) {
            deleteProject(id);
            loadProjects();
        }
    };
    if (!isOpen)
        return null;
    return (_jsxs("div", { className: "fixed inset-0 z-[200] flex items-center justify-center p-4", children: [_jsx("div", { className: "absolute inset-0 bg-black/50 backdrop-blur-sm", onClick: onClose }), _jsxs("div", { className: "relative w-full max-w-2xl max-h-[80vh] bg-background rounded-xl shadow-2xl overflow-hidden animate-scale-in flex flex-col", children: [_jsxs("div", { className: "px-6 py-4 border-b border-border flex items-center justify-between", children: [_jsx("h2", { className: "text-lg font-semibold", children: "Projects" }), _jsx("button", { onClick: onClose, className: "p-2 rounded-lg hover:bg-muted", "aria-label": "Close", children: _jsx("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) })] }), _jsx("div", { className: "flex-1 overflow-auto p-6", children: isLoading ? (_jsx("div", { className: "flex items-center justify-center py-12", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-2 border-primary-200 border-t-primary-600" }) })) : projects.length === 0 ? (_jsxs("div", { className: "text-center py-12", children: [_jsx("div", { className: "text-4xl mb-4", children: "\uD83D\uDCC1" }), _jsx("p", { className: "text-muted-foreground", children: "No saved projects yet" }), _jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Create your first project to see it here" })] })) : (_jsx("div", { className: "grid gap-3", children: projects.map(project => (_jsx("div", { className: "p-4 rounded-lg border border-border hover:border-primary-300 hover:shadow-md transition-all cursor-pointer group", onClick: () => { onLoad(project); onClose(); }, children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("h3", { className: "font-medium truncate", children: project.name }), project.description && (_jsx("p", { className: "text-sm text-muted-foreground truncate mt-1", children: project.description })), _jsxs("div", { className: "flex items-center gap-3 mt-2 text-xs text-muted-foreground", children: [_jsxs("span", { children: [project.sections.length, " sections"] }), _jsx("span", { children: "\u2022" }), _jsx("span", { children: new Date(project.updatedAt).toLocaleDateString() })] })] }), _jsx("button", { onClick: (e) => { e.stopPropagation(); handleDelete(project.id); }, className: "p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 text-red-500 transition-all", "aria-label": "Delete project", children: _jsx("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" }) }) })] }) }, project.id))) })) }), _jsx("div", { className: "px-6 py-4 border-t border-border bg-muted/50", children: _jsx("button", { onClick: () => { onNew(); onClose(); }, className: "w-full py-2 px-4 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors", children: "+ New Project" }) })] })] }));
}
export default ProjectManager;
//# sourceMappingURL=ProjectManager.js.map