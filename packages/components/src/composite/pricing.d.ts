/**
 * WebBuilder Components - Pricing Table Component
 * A pricing section with tier cards, feature lists, and CTA buttons.
 */
import React from 'react';
export type PricingInterval = 'monthly' | 'yearly';
export interface PricingTier {
    name: string;
    description?: string;
    price: number | string;
    interval?: string;
    currency?: string;
    features: string[];
    highlighted?: boolean;
    badge?: string;
    ctaText?: string;
    ctaLink?: string;
    onSelect?: () => void;
}
export interface PricingProps extends React.HTMLAttributes<HTMLElement> {
    title?: string;
    subtitle?: string;
    tiers: PricingTier[];
    currency?: string;
    showIntervalToggle?: boolean;
    defaultInterval?: PricingInterval;
    onIntervalChange?: (interval: PricingInterval) => void;
    backgroundColor?: string;
}
export declare const Pricing: React.ForwardRefExoticComponent<PricingProps & React.RefAttributes<HTMLElement>>;
export default Pricing;
//# sourceMappingURL=pricing.d.ts.map