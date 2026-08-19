/**
 * WebBuilder Components - Icon Component
 * A flexible icon component with multiple sizes and colors.
 */
import React from 'react';
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
    name?: string;
    size?: IconSize;
    color?: string;
    icon?: React.ReactNode;
}
export declare const Icon: React.ForwardRefExoticComponent<IconProps & React.RefAttributes<HTMLSpanElement>>;
export default Icon;
//# sourceMappingURL=icon.d.ts.map