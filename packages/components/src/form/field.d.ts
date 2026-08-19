/**
 * WebBuilder Components - Field Component
 * A form field wrapper with label, error, and helper text.
 */
import React from 'react';
export type FieldOrientation = 'vertical' | 'horizontal';
export interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {
    label?: string;
    htmlFor?: string;
    error?: string;
    helperText?: string;
    required?: boolean;
    disabled?: boolean;
    orientation?: FieldOrientation;
    labelWidth?: string;
    size?: 'sm' | 'md' | 'lg';
}
export declare const Field: React.ForwardRefExoticComponent<FieldProps & React.RefAttributes<HTMLDivElement>>;
export default Field;
//# sourceMappingURL=field.d.ts.map