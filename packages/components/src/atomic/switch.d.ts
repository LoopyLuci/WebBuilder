/**
 * WebBuilder Components - Atomic Switch Component
 * A toggle switch with label and error support.
 */
import React from 'react';
export type SwitchSize = 'sm' | 'md' | 'lg';
export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
    label?: string;
    description?: string;
    size?: SwitchSize;
    error?: string;
    onOffLabels?: boolean;
}
export declare const Switch: React.ForwardRefExoticComponent<SwitchProps & React.RefAttributes<HTMLInputElement>>;
export default Switch;
//# sourceMappingURL=switch.d.ts.map