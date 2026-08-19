import React from 'react';
export interface DropdownItem {
    label: string;
    value: string;
    icon?: React.ReactNode;
    disabled?: boolean;
    danger?: boolean;
}
export interface DropdownProps {
    trigger: React.ReactNode;
    items: DropdownItem[];
    onSelect?: (value: string) => void;
    className?: string;
    align?: 'left' | 'right';
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}
export declare const Dropdown: React.ForwardRefExoticComponent<DropdownProps & React.RefAttributes<HTMLDivElement>>;
export default Dropdown;
//# sourceMappingURL=Dropdown.d.ts.map