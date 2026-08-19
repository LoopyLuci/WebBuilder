/**
 * WebBuilder Components - Testimonials Section Component
 * A testimonials section with quotes, avatars, and ratings.
 */
import React from 'react';
export type TestimonialsLayout = 'grid' | 'carousel' | 'masonry';
export interface Testimonial {
    id?: string | number;
    content: string;
    author: {
        name: string;
        role?: string;
        company?: string;
        avatar?: string;
    };
    rating?: number;
    featured?: boolean;
}
export interface TestimonialsProps extends React.HTMLAttributes<HTMLElement> {
    title?: string;
    subtitle?: string;
    testimonials: Testimonial[];
    layout?: TestimonialsLayout;
    columns?: 1 | 2 | 3;
    showRating?: boolean;
    backgroundColor?: string;
}
export declare const Testimonials: React.ForwardRefExoticComponent<TestimonialsProps & React.RefAttributes<HTMLElement>>;
export default Testimonials;
//# sourceMappingURL=testimonials.d.ts.map