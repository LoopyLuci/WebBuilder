/**
 * WebBuilder Components - Atomic Select Component
 * A flexible select dropdown with label, error, and helper text support.
 */
import React from 'react';
export type SelectSize = 'sm' | 'md' | 'lg';
export interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}
export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
    label?: string;
    error?: string;
    helperText?: string;
    size?: SelectSize;
    fullWidth?: boolean;
    options: SelectOption[];
    placeholder?: string;
}
export declare const Select: React.ForwardRefExoticComponent<SelectProps & React.RefAttributes<HTMLSelectElement>>;
export default Select;
//# sourceMappingURL=select.d.ts.map