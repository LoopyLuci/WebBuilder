/**
 * WebBuilder Components - Stats Component
 * A statistics display component with icons, trends, and grid layout.
 */
import React from 'react';
export interface StatItem {
    id: string;
    label: string;
    value: string | number;
    description?: string;
    icon?: React.ReactNode;
    trend?: {
        value: string;
        direction: 'up' | 'down';
        label?: string;
    };
    color?: string;
}
export interface StatsProps extends React.HTMLAttributes<HTMLDivElement> {
    stats: StatItem[];
    columns?: 1 | 2 | 3 | 4;
    variant?: 'default' | 'cards' | 'minimal' | 'bordered';
    size?: 'sm' | 'md' | 'lg';
}
export declare const Stats: React.ForwardRefExoticComponent<StatsProps & React.RefAttributes<HTMLDivElement>>;
export default Stats;
//# sourceMappingURL=stats.d.ts.map