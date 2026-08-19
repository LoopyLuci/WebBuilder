/**
 * WebBuilder Components - Container Component
 * A responsive container with max-width variants.
 */
import React from 'react';
export type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    size?: ContainerSize;
    centered?: boolean;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    maxWidth?: string;
}
export declare const Container: React.ForwardRefExoticComponent<ContainerProps & React.RefAttributes<HTMLDivElement>>;
export default Container;
//# sourceMappingURL=container.d.ts.map