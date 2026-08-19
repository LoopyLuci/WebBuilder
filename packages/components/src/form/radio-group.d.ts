/**
 * WebBuilder Components - RadioGroup Component
 * A group of radio buttons with label and layout options.
 */
import React from 'react';
export interface RadioOption {
    value: string;
    label: string;
    description?: string;
    disabled?: boolean;
}
export interface RadioGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
    label?: string;
    name: string;
    options: RadioOption[];
    value: string;
    onChange: (value: string) => void;
    orientation?: 'horizontal' | 'vertical';
    size?: 'sm' | 'md' | 'lg';
    error?: string;
    helperText?: string;
    disabled?: boolean;
}
export declare const RadioGroup: React.ForwardRefExoticComponent<RadioGroupProps & React.RefAttributes<HTMLDivElement>>;
export default RadioGroup;
//# sourceMappingURL=radio-group.d.ts.map