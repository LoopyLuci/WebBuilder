import React from 'react';
declare const badgeVariants: {
    primary: string;
    success: string;
    warning: string;
    error: string;
    default: string;
};
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: keyof typeof badgeVariants;
    dot?: boolean;
}
export declare const Badge: React.ForwardRefExoticComponent<BadgeProps & React.RefAttributes<HTMLSpanElement>>;
export default Badge;
//# sourceMappingURL=Badge.d.ts.map