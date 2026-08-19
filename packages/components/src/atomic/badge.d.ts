import React from 'react';
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
    size?: 'sm' | 'md' | 'lg';
    dot?: boolean;
}
export declare const Badge: React.FC<BadgeProps>;
export default Badge;
//# sourceMappingURL=badge.d.ts.map