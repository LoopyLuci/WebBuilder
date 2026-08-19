/**
 * WebBuilder Components - InputGroup Component
 * Groups multiple inputs with addons, buttons, and icons.
 */
import React from 'react';
export type InputGroupSize = 'sm' | 'md' | 'lg';
export interface InputGroupProps extends React.HTMLAttributes<HTMLDivElement> {
    size?: InputGroupSize;
    fullWidth?: boolean;
}
export declare const InputGroup: React.ForwardRefExoticComponent<InputGroupProps & React.RefAttributes<HTMLDivElement>>;
export interface InputGroupAddonProps extends React.HTMLAttributes<HTMLSpanElement> {
    size?: InputGroupSize;
    position?: 'left' | 'right';
    variant?: 'default' | 'filled' | 'outline';
}
export declare const InputGroupAddon: React.ForwardRefExoticComponent<InputGroupAddonProps & React.RefAttributes<HTMLSpanElement>>;
export interface InputGroupButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    size?: InputGroupSize;
    position?: 'left' | 'right';
    variant?: 'default' | 'primary' | 'outline';
}
export declare const InputGroupButton: React.ForwardRefExoticComponent<InputGroupButtonProps & React.RefAttributes<HTMLButtonElement>>;
declare const _default: React.ForwardRefExoticComponent<InputGroupProps & React.RefAttributes<HTMLDivElement>> & {
    Addon: React.ForwardRefExoticComponent<InputGroupAddonProps & React.RefAttributes<HTMLSpanElement>>;
    Button: React.ForwardRefExoticComponent<InputGroupButtonProps & React.RefAttributes<HTMLButtonElement>>;
};
export default _default;
//# sourceMappingURL=input-group.d.ts.map