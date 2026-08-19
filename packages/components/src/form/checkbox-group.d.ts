/**
 * WebBuilder Components - CheckboxGroup Component
 * A group of checkboxes with label and layout options.
 */
import React from 'react';
export interface CheckboxOption {
    value: string;
    label: string;
    description?: string;
    disabled?: boolean;
}
export interface CheckboxGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
    label?: string;
    options: CheckboxOption[];
    value: string[];
    onChange: (value: string[]) => void;
    orientation?: 'horizontal' | 'vertical';
    size?: 'sm' | 'md' | 'lg';
    error?: string;
    helperText?: string;
    disabled?: boolean;
}
export declare const CheckboxGroup: React.ForwardRefExoticComponent<CheckboxGroupProps & React.RefAttributes<HTMLDivElement>>;
export default CheckboxGroup;
//# sourceMappingURL=checkbox-group.d.ts.map