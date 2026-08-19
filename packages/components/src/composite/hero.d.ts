/**
 * WebBuilder Components - Hero Section Component
 * A hero section with title, subtitle, CTA, and background image support.
 */
import React from 'react';
export type HeroLayout = 'center' | 'left' | 'right' | 'split';
export interface HeroProps extends React.HTMLAttributes<HTMLElement> {
    layout?: HeroLayout;
    title: string;
    subtitle?: string;
    description?: string;
    backgroundImage?: string;
    backgroundColor?: string;
    overlay?: boolean;
    overlayOpacity?: number;
    cta?: React.ReactNode;
    secondaryCta?: React.ReactNode;
    height?: 'auto' | 'half' | 'full' | 'large';
}
export declare const Hero: React.ForwardRefExoticComponent<HeroProps & React.RefAttributes<HTMLElement>>;
export default Hero;
//# sourceMappingURL=hero.d.ts.map