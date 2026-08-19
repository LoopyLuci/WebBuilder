/**
 * WebBuilder Components - Atomic Avatar Component
 * A flexible avatar component with image, initials fallback, and status indicator.
 */
import React from 'react';
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type AvatarStatus = 'online' | 'offline' | 'away' | 'busy';
export type AvatarShape = 'circle' | 'square' | 'rounded';
export interface AvatarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
    src?: string;
    alt?: string;
    name?: string;
    size?: AvatarSize;
    shape?: AvatarShape;
    status?: AvatarStatus;
    bordered?: boolean;
}
export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    max?: number;
    size?: AvatarSize;
    stacked?: boolean;
}
export declare const Avatar: React.ForwardRefExoticComponent<AvatarProps & React.RefAttributes<HTMLDivElement>>;
export declare const AvatarGroup: React.ForwardRefExoticComponent<AvatarGroupProps & React.RefAttributes<HTMLDivElement>>;
export default Avatar;
//# sourceMappingURL=avatar.d.ts.map