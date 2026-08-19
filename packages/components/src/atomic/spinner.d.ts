/**
 * WebBuilder Components - Spinner Component
 * A loading spinner with multiple sizes and colors.
 */
import React from 'react';
export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
    size?: SpinnerSize;
    color?: string;
    label?: string;
}
export declare const Spinner: React.ForwardRefExoticComponent<SpinnerProps & React.RefAttributes<HTMLDivElement>>;
export default Spinner;
//# sourceMappingURL=spinner.d.ts.map