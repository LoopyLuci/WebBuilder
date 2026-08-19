import React from 'react';
interface Command {
    id: string;
    label: string;
    description?: string;
    icon?: React.ReactNode;
    category: string;
    shortcut?: string;
    action: () => void;
}
interface CommandPaletteProps {
    commands: Command[];
    isOpen: boolean;
    onClose: () => void;
}
export declare function CommandPalette({ commands, isOpen, onClose }: CommandPaletteProps): React.JSX.Element | null;
export default CommandPalette;
//# sourceMappingURL=CommandPalette.d.ts.map