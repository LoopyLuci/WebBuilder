/**
 * WebBuilder Components - Tooltip Component
 * A hover-triggered tooltip with positioning support.
 */
import React from 'react';
export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';
export interface TooltipProps extends React.HTMLAttributes<HTMLDivElement> {
    content: React.ReactNode;
    position?: TooltipPosition;
    delay?: number;
    disabled?: boolean;
    children: React.ReactNode;
}
export declare const Tooltip: React.ForwardRefExoticComponent<TooltipProps & React.RefAttributes<HTMLDivElement>>;
export default Tooltip;
//# sourceMappingURL=tooltip.d.ts.map