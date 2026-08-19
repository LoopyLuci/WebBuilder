/**
 * WebBuilder Components - Call-to-Action Section Component
 * A CTA section with title, description, and action buttons.
 */
import React from 'react';
export type CTAVariant = 'default' | 'primary' | 'minimal' | 'gradient';
export interface CTAProps extends React.HTMLAttributes<HTMLElement> {
    title: string;
    description?: string;
    variant?: CTAVariant;
    primaryAction?: React.ReactNode;
    secondaryAction?: React.ReactNode;
    backgroundColor?: string;
    backgroundImage?: string;
    overlay?: boolean;
    align?: 'left' | 'center' | 'right';
    size?: 'sm' | 'md' | 'lg';
}
export declare const CTA: React.ForwardRefExoticComponent<CTAProps & React.RefAttributes<HTMLElement>>;
export default CTA;
//# sourceMappingURL=cta.d.ts.map