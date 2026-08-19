import React from 'react';
declare const avatarSizes: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
};
declare const statusColors: {
    online: string;
    offline: string;
    away: string;
    busy: string;
};
export interface AvatarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
    src?: string;
    alt?: string;
    name?: string;
    size?: keyof typeof avatarSizes;
    status?: keyof typeof statusColors;
}
export declare const Avatar: React.ForwardRefExoticComponent<AvatarProps & React.RefAttributes<HTMLDivElement>>;
export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    max?: number;
    size?: keyof typeof avatarSizes;
}
export declare const AvatarGroup: React.ForwardRefExoticComponent<AvatarGroupProps & React.RefAttributes<HTMLDivElement>>;
export {};
//# sourceMappingURL=Avatar.d.ts.map