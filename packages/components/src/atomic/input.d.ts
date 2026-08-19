/**
 * WebBuilder Components - Atomic Input Component
 * A flexible text input with label, error, and helper text support.
 */
import React from 'react';
export type InputSize = 'sm' | 'md' | 'lg';
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
    label?: string;
    error?: string;
    helperText?: string;
    size?: InputSize;
    fullWidth?: boolean;
    leftAddon?: React.ReactNode;
    rightAddon?: React.ReactNode;
}
export declare const Input: React.ForwardRefExoticComponent<InputProps & React.RefAttributes<HTMLInputElement>>;
export default Input;
//# sourceMappingURL=input.d.ts.map