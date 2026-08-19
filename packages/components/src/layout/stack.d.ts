/**
 * WebBuilder Components - Stack Component
 * A flexbox-based stack for vertical/horizontal layouts.
 */
import React from 'react';
export type StackDirection = 'horizontal' | 'vertical';
export type StackSpacing = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type StackAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
export type StackJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
    direction?: StackDirection;
    spacing?: StackSpacing;
    align?: StackAlign;
    justify?: StackJustify;
    wrap?: boolean;
    dividers?: boolean;
    reverse?: boolean;
}
export declare const Stack: React.ForwardRefExoticComponent<StackProps & React.RefAttributes<HTMLDivElement>>;
export default Stack;
//# sourceMappingURL=stack.d.ts.map