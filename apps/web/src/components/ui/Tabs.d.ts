import React from 'react';
export interface Tab {
    label: string;
    value: string;
    icon?: React.ReactNode;
    disabled?: boolean;
}
export interface TabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
    tabs: Tab[];
    activeTab?: string;
    defaultTab?: string;
    onChange?: (value: string) => void;
    variant?: 'underline' | 'pill';
}
export declare const Tabs: React.ForwardRefExoticComponent<TabsProps & React.RefAttributes<HTMLDivElement>>;
export interface TabPanelProps extends React.HTMLAttributes<HTMLDivElement> {
    value: string;
}
export declare const TabPanel: React.ForwardRefExoticComponent<TabPanelProps & React.RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=Tabs.d.ts.map