/**
 * WebBuilder Components - Responsive Navigation Bar Component
 * A responsive navbar with logo, links, and mobile menu.
 */
import React from 'react';
export interface NavItem {
    label: string;
    href: string;
    active?: boolean;
    children?: NavItem[];
    badge?: string;
    external?: boolean;
}
export interface NavbarProps extends React.HTMLAttributes<HTMLElement> {
    logo?: React.ReactNode;
    items: NavItem[];
    actions?: React.ReactNode;
    sticky?: boolean;
    transparent?: boolean;
    mobileBreakpoint?: 'sm' | 'md' | 'lg';
    backgroundColor?: string;
}
export declare const Navbar: React.ForwardRefExoticComponent<NavbarProps & React.RefAttributes<HTMLElement>>;
export default Navbar;
//# sourceMappingURL=navbar.d.ts.map