/**
 * WebBuilder Components - Popover Component
 * A click-triggered popover with positioning and rich content support.
 */
import React from 'react';
export type PopoverPosition = 'top' | 'bottom' | 'left' | 'right';
export interface PopoverProps extends React.HTMLAttributes<HTMLDivElement> {
    content: React.ReactNode;
    position?: PopoverPosition;
    trigger?: 'click' | 'hover';
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    showArrow?: boolean;
    title?: string;
    children: React.ReactNode;
}
export declare const Popover: React.ForwardRefExoticComponent<PopoverProps & React.RefAttributes<HTMLDivElement>>;
export default Popover;
//# sourceMappingURL=popover.d.ts.map