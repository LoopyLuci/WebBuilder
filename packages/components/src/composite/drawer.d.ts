/**
 * WebBuilder Components - Drawer Component
 * A slide-out panel from any edge of the screen.
 */
import React from 'react';
export type DrawerPosition = 'left' | 'right' | 'top' | 'bottom';
export type DrawerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
export interface DrawerProps extends React.HTMLAttributes<HTMLDivElement> {
    open: boolean;
    onClose: () => void;
    position?: DrawerPosition;
    size?: DrawerSize;
    title?: string;
    description?: string;
    closeOnOverlay?: boolean;
    closeOnEsc?: boolean;
    showCloseButton?: boolean;
    footer?: React.ReactNode;
}
export declare const Drawer: React.ForwardRefExoticComponent<DrawerProps & React.RefAttributes<HTMLDivElement>>;
export default Drawer;
//# sourceMappingURL=drawer.d.ts.map