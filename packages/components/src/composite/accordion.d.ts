/**
 * WebBuilder Components - Accordion Component
 * A collapsible accordion with single or multiple expand modes.
 */
import React from 'react';
export interface AccordionItem {
    id: string;
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    badge?: string;
    disabled?: boolean;
    content: React.ReactNode;
}
export interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
    items: AccordionItem[];
    defaultExpanded?: string[];
    expanded?: string[];
    onExpandedChange?: (expanded: string[]) => void;
    multiple?: boolean;
    variant?: 'default' | 'bordered' | 'separated';
    size?: 'sm' | 'md' | 'lg';
}
export declare const Accordion: React.ForwardRefExoticComponent<AccordionProps & React.RefAttributes<HTMLDivElement>>;
export default Accordion;
//# sourceMappingURL=accordion.d.ts.map