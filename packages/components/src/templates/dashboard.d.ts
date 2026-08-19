/**
 * WebBuilder Components - Dashboard Layout Template
 * A complete dashboard layout with sidebar, header, and main content area.
 */
import React from 'react';
export interface DashboardProps {
    sidebar?: React.ReactNode;
    header?: React.ReactNode;
    children: React.ReactNode;
    sidebarCollapsed?: boolean;
    onSidebarCollapseChange?: (collapsed: boolean) => void;
    contentPadding?: 'none' | 'sm' | 'md' | 'lg';
}
export interface DashboardHeaderProps extends React.HTMLAttributes<HTMLElement> {
    logo?: React.ReactNode;
    title?: string;
    breadcrumbs?: {
        label: string;
        href?: string;
    }[];
    actions?: React.ReactNode;
    userMenu?: React.ReactNode;
    search?: React.ReactNode;
}
export interface DashboardContentProps extends React.HTMLAttributes<HTMLElement> {
    padding?: 'none' | 'sm' | 'md' | 'lg';
    maxWidth?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}
export interface DashboardCardProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string;
    description?: string;
    icon?: React.ReactNode;
    actions?: React.ReactNode;
    noPadding?: boolean;
    hoverable?: boolean;
}
export interface DashboardStatProps {
    label: string;
    value: string | number;
    change?: {
        value: number;
        type: 'increase' | 'decrease' | 'neutral';
    };
    icon?: React.ReactNode;
    trend?: number[];
}
export interface DashboardChartProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string;
    subtitle?: string;
    children: React.ReactNode;
    actions?: React.ReactNode;
}
export declare const DashboardHeader: React.ForwardRefExoticComponent<DashboardHeaderProps & React.RefAttributes<HTMLElement>>;
export declare const DashboardContent: React.ForwardRefExoticComponent<DashboardContentProps & React.RefAttributes<HTMLElement>>;
export declare const DashboardCard: React.ForwardRefExoticComponent<DashboardCardProps & React.RefAttributes<HTMLDivElement>>;
export declare const DashboardStat: React.FC<DashboardStatProps>;
export declare const DashboardChart: React.ForwardRefExoticComponent<DashboardChartProps & React.RefAttributes<HTMLDivElement>>;
export declare const Dashboard: React.FC<DashboardProps>;
declare const _default: React.FC<DashboardProps> & {
    Header: React.ForwardRefExoticComponent<DashboardHeaderProps & React.RefAttributes<HTMLElement>>;
    Content: React.ForwardRefExoticComponent<DashboardContentProps & React.RefAttributes<HTMLElement>>;
    Card: React.ForwardRefExoticComponent<DashboardCardProps & React.RefAttributes<HTMLDivElement>>;
    Stat: React.FC<DashboardStatProps>;
    Chart: React.ForwardRefExoticComponent<DashboardChartProps & React.RefAttributes<HTMLDivElement>>;
};
export default _default;
//# sourceMappingURL=dashboard.d.ts.map