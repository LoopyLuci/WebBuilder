'use client';

import React, { useState } from 'react';
import { getSavedProjects, deleteProject, SavedProject } from '@/editor';

interface ProjectManagerProps {
  onLoad: (project: SavedProject) => void;
  onNew: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectManager({ onLoad, onNew, isOpen, onClose }: ProjectManagerProps) {
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadProjects = () => {
    setIsLoading(true);
    setProjects(getSavedProjects());
    setIsLoading(false);
  };

  React.useEffect(() => {
    if (isOpen) loadProjects();
  }, [isOpen]);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      deleteProject(id);
      loadProjects();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[80vh] bg-background rounded-xl shadow-2xl overflow-hidden animate-scale-in flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-semibold">Projects</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-200 border-t-primary-600" />
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📁</div>
              <p className="text-muted-foreground">No saved projects yet</p>
              <p className="text-sm text-muted-foreground mt-1">Create your first project to see it here</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {projects.map(project => (
                <div
                  key={project.id}
                  className="p-4 rounded-lg border border-border hover:border-primary-300 hover:shadow-md transition-all cursor-pointer group"
                  onClick={() => { onLoad(project); onClose(); }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{project.name}</h3>
                      {project.description && (
                        <p className="text-sm text-muted-foreground truncate mt-1">{project.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span>{project.sections.length} sections</span>
                        <span>•</span>
                        <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(project.id); }}
                      className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 text-red-500 transition-all"
                      aria-label="Delete project"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-muted/50">
          <button
            onClick={() => { onNew(); onClose(); }}
            className="w-full py-2 px-4 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            + New Project
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProjectManager;
