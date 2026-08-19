import React from 'react';
interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    secondaryAction?: {
        label: string;
        onClick: () => void;
    };
}
export declare function EmptyState({ icon, title, description, action, secondaryAction }: EmptyStateProps): React.JSX.Element;
export default EmptyState;
//# sourceMappingURL=EmptyState.d.ts.map