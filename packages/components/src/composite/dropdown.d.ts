/**
 * WebBuilder Components - Dropdown Component
 * A flexible dropdown menu with items, groups, and keyboard navigation.
 */
import React from 'react';
export interface DropdownItem {
    id: string;
    label: string;
    icon?: React.ReactNode;
    disabled?: boolean;
    danger?: boolean;
    onClick?: () => void;
}
export interface DropdownGroup {
    title?: string;
    items: DropdownItem[];
}
export interface DropdownProps extends React.HTMLAttributes<HTMLDivElement> {
    trigger: React.ReactNode;
    groups: DropdownGroup[];
    position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    width?: string;
}
export declare const Dropdown: React.ForwardRefExoticComponent<DropdownProps & React.RefAttributes<HTMLDivElement>>;
export default Dropdown;
//# sourceMappingURL=dropdown.d.ts.map