/**
 * WebBuilder Components - Atomic Textarea Component
 * A flexible textarea with label, error, and helper text support.
 */
import React from 'react';
export type TextareaSize = 'sm' | 'md' | 'lg';
export interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
    label?: string;
    error?: string;
    helperText?: string;
    size?: TextareaSize;
    fullWidth?: boolean;
    resize?: 'none' | 'both' | 'horizontal' | 'vertical';
}
export declare const Textarea: React.ForwardRefExoticComponent<TextareaProps & React.RefAttributes<HTMLTextAreaElement>>;
export default Textarea;
//# sourceMappingURL=textarea.d.ts.map