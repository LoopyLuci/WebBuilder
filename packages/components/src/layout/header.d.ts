/**
 * WebBuilder Components - Header Component
 * A page header with title, description, and action slots.
 */
import React from 'react';
export interface HeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    title: string;
    subtitle?: string;
    description?: string;
    actions?: React.ReactNode;
    breadcrumbs?: React.ReactNode;
    centered?: boolean;
    size?: 'sm' | 'md' | 'lg';
}
export declare const Header: React.ForwardRefExoticComponent<HeaderProps & React.RefAttributes<HTMLDivElement>>;
export default Header;
//# sourceMappingURL=header.d.ts.map