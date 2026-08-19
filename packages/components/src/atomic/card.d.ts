/**
 * WebBuilder Components - Atomic Card Component
 * A flexible card with image, title, description, and footer slots.
 */
import React from 'react';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    padding?: CardPadding;
    hoverable?: boolean;
    bordered?: boolean;
}
export interface CardImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    aspectRatio?: '16:9' | '4:3' | '1:1' | 'auto';
}
export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}
export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
}
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
}
export declare const Card: React.ForwardRefExoticComponent<CardProps & React.RefAttributes<HTMLDivElement>>;
export declare const CardImage: React.ForwardRefExoticComponent<CardImageProps & React.RefAttributes<HTMLDivElement>>;
export declare const CardBody: React.ForwardRefExoticComponent<CardProps & React.RefAttributes<HTMLDivElement>>;
export declare const CardTitle: React.ForwardRefExoticComponent<CardTitleProps & React.RefAttributes<HTMLHeadingElement>>;
export declare const CardDescription: React.ForwardRefExoticComponent<CardDescriptionProps & React.RefAttributes<HTMLParagraphElement>>;
export declare const CardFooter: React.ForwardRefExoticComponent<CardFooterProps & React.RefAttributes<HTMLDivElement>>;
declare const _default: React.ForwardRefExoticComponent<CardProps & React.RefAttributes<HTMLDivElement>> & {
    Image: React.ForwardRefExoticComponent<CardImageProps & React.RefAttributes<HTMLDivElement>>;
    Body: React.ForwardRefExoticComponent<CardProps & React.RefAttributes<HTMLDivElement>>;
    Title: React.ForwardRefExoticComponent<CardTitleProps & React.RefAttributes<HTMLHeadingElement>>;
    Description: React.ForwardRefExoticComponent<CardDescriptionProps & React.RefAttributes<HTMLParagraphElement>>;
    Footer: React.ForwardRefExoticComponent<CardFooterProps & React.RefAttributes<HTMLDivElement>>;
};
export default _default;
//# sourceMappingURL=card.d.ts.map