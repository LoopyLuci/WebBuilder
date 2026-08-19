/**
 * WebBuilder Components - Tabs Component
 * A flexible tabs component with multiple variants.
 */
import React from 'react';
export type TabsVariant = 'default' | 'pills' | 'underline' | 'boxed';
export interface TabItem {
    id: string;
    label: string;
    icon?: React.ReactNode;
    badge?: string | number;
    disabled?: boolean;
    content: React.ReactNode;
}
export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
    tabs: TabItem[];
    defaultTab?: string;
    activeTab?: string;
    onTabChange?: (tabId: string) => void;
    variant?: TabsVariant;
    fullWidth?: boolean;
}
export declare const Tabs: React.ForwardRefExoticComponent<TabsProps & React.RefAttributes<HTMLDivElement>>;
export default Tabs;
//# sourceMappingURL=tabs.d.ts.map