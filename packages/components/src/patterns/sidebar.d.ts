/**
 * WebBuilder Components - Sidebar Navigation Component
 * A side navigation with collapsible menu items and icons.
 */
import React from 'react';
export interface SidebarItem {
    id: string;
    label: string;
    icon?: React.ReactNode;
    href?: string;
    active?: boolean;
    badge?: string | number;
    children?: SidebarItem[];
    disabled?: boolean;
    onClick?: () => void;
}
export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
    items: SidebarItem[];
    logo?: React.ReactNode;
    footer?: React.ReactNode;
    collapsible?: boolean;
    collapsed?: boolean;
    defaultCollapsed?: boolean;
    onCollapseChange?: (collapsed: boolean) => void;
    width?: number;
    collapsedWidth?: number;
    backgroundColor?: string;
    showSearch?: boolean;
    searchPlaceholder?: string;
}
export declare const Sidebar: React.ForwardRefExoticComponent<SidebarProps & React.RefAttributes<HTMLElement>>;
export default Sidebar;
//# sourceMappingURL=sidebar.d.ts.map