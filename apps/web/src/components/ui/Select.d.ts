import React from 'react';
export interface SelectOption {
    label: string;
    value: string;
    icon?: React.ReactNode;
    disabled?: boolean;
}
export interface SelectProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
    options: SelectOption[];
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    searchable?: boolean;
    disabled?: boolean;
    error?: string;
    label?: string;
    size?: 'sm' | 'md' | 'lg';
}
export declare const Select: React.ForwardRefExoticComponent<SelectProps & React.RefAttributes<HTMLDivElement>>;
export default Select;
//# sourceMappingURL=Select.d.ts.map