import React from 'react';
export interface ToggleProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
    label?: string;
    description?: string;
    size?: 'sm' | 'md' | 'lg';
    error?: string;
}
export declare const Toggle: React.ForwardRefExoticComponent<ToggleProps & React.RefAttributes<HTMLInputElement>>;
export default Toggle;
//# sourceMappingURL=Toggle.d.ts.map