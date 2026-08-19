/**
 * WebBuilder Components - Divider Component
 * A flexible divider with optional label and multiple orientations.
 */
import React from 'react';
export type DividerOrientation = 'horizontal' | 'vertical';
export type DividerVariant = 'solid' | 'dashed' | 'dotted';
export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
    orientation?: DividerOrientation;
    variant?: DividerVariant;
    label?: string;
    labelPosition?: 'left' | 'center' | 'right';
    color?: string;
    spacing?: 'sm' | 'md' | 'lg';
}
export declare const Divider: React.ForwardRefExoticComponent<DividerProps & React.RefAttributes<HTMLDivElement>>;
export default Divider;
//# sourceMappingURL=divider.d.ts.map