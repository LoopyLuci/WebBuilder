import React from 'react';
export interface ListItem {
    id: string;
    title: string;
    description?: string;
    icon?: React.ReactNode;
    avatar?: string;
    badge?: string;
    meta?: string;
    actions?: React.ReactNode;
    href?: string;
}
export interface ListProps {
    items: ListItem[];
    variant?: 'default' | 'bordered' | 'separated';
    size?: 'sm' | 'md' | 'lg';
    onClick?: (item: ListItem) => void;
    className?: string;
}
export declare const List: React.FC<ListProps>;
export default List;
//# sourceMappingURL=list.d.ts.map