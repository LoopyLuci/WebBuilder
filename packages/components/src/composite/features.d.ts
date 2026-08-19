/**
 * WebBuilder Components - Features Grid Section Component
 * A features section with icon, title, description grid.
 */
import React from 'react';
export type FeaturesLayout = 'grid' | 'list' | 'cards';
export type FeaturesColumns = 1 | 2 | 3 | 4;
export interface FeatureItem {
    icon?: React.ReactNode;
    title: string;
    description: string;
    link?: string;
    linkText?: string;
}
export interface FeaturesProps extends React.HTMLAttributes<HTMLElement> {
    title?: string;
    subtitle?: string;
    features: FeatureItem[];
    layout?: FeaturesLayout;
    columns?: FeaturesColumns;
    centered?: boolean;
    backgroundColor?: string;
}
export declare const Features: React.ForwardRefExoticComponent<FeaturesProps & React.RefAttributes<HTMLElement>>;
export default Features;
//# sourceMappingURL=features.d.ts.map