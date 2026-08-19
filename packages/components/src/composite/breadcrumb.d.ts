/**
 * WebBuilder Components - Breadcrumb Component
 * A navigation breadcrumb with separators and collapse support.
 */
import React from 'react';
export interface BreadcrumbItem {
    label: string;
    href?: string;
    icon?: React.ReactNode;
    active?: boolean;
}
export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
    items: BreadcrumbItem[];
    separator?: React.ReactNode;
    maxItems?: number;
    size?: 'sm' | 'md' | 'lg';
}
export declare const Breadcrumb: React.ForwardRefExoticComponent<BreadcrumbProps & React.RefAttributes<HTMLElement>>;
export default Breadcrumb;
//# sourceMappingURL=breadcrumb.d.ts.map