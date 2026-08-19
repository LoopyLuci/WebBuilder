import React from 'react';
import { SavedProject } from '@/editor';
interface ProjectManagerProps {
    onLoad: (project: SavedProject) => void;
    onNew: () => void;
    isOpen: boolean;
    onClose: () => void;
}
export declare function ProjectManager({ onLoad, onNew, isOpen, onClose }: ProjectManagerProps): React.JSX.Element | null;
export default ProjectManager;
//# sourceMappingURL=ProjectManager.d.ts.map