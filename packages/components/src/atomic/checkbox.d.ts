/**
 * WebBuilder Components - Atomic Checkbox Component
 * A flexible checkbox with label, indeterminate state, and error support.
 */
import React from 'react';
export type CheckboxSize = 'sm' | 'md' | 'lg';
export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLCheckboxElement>, 'size'> {
    label?: string;
    description?: string;
    size?: CheckboxSize;
    error?: string;
    indeterminate?: boolean;
}
export declare const Checkbox: React.ForwardRefExoticComponent<CheckboxProps & React.RefAttributes<HTMLInputElement>>;
export default Checkbox;
//# sourceMappingURL=checkbox.d.ts.map