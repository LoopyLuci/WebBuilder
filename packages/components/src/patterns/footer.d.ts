/**
 * WebBuilder Components - Footer Component
 * A flexible footer with link columns, social icons, and copyright.
 */
import React from 'react';
export interface FooterLink {
    label: string;
    href: string;
    external?: boolean;
}
export interface FooterColumn {
    title: string;
    links: FooterLink[];
}
export interface FooterProps extends React.HTMLAttributes<HTMLElement> {
    columns: FooterColumn[];
    logo?: React.ReactNode;
    description?: string;
    socialLinks?: {
        icon: React.ReactNode;
        href: string;
        label: string;
    }[];
    copyright?: string;
    backgroundColor?: string;
    newsletter?: {
        title: string;
        description?: string;
        placeholder?: string;
        buttonText?: string;
        onSubmit: (email: string) => void;
    };
}
export declare const Footer: React.ForwardRefExoticComponent<FooterProps & React.RefAttributes<HTMLElement>>;
export default Footer;
//# sourceMappingURL=footer.d.ts.map