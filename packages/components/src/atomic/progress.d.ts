/**
 * WebBuilder Components - Progress Component
 * A progress bar with multiple variants, sizes, and animations.
 */
import React from 'react';
export type ProgressVariant = 'default' | 'success' | 'warning' | 'danger';
export type ProgressSize = 'sm' | 'md' | 'lg';
export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
    value: number;
    max?: number;
    variant?: ProgressVariant;
    size?: ProgressSize;
    showLabel?: boolean;
    animated?: boolean;
    striped?: boolean;
    label?: string;
}
export declare const Progress: React.ForwardRefExoticComponent<ProgressProps & React.RefAttributes<HTMLDivElement>>;
export default Progress;
//# sourceMappingURL=progress.d.ts.map