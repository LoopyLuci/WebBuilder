/**
 * WebBuilder Components - Atomic Radio Component
 * A flexible radio button with label and error support.
 */
import React from 'react';
export type RadioSize = 'sm' | 'md' | 'lg';
export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
    label?: string;
    description?: string;
    size?: RadioSize;
    error?: string;
}
export declare const Radio: React.ForwardRefExoticComponent<RadioProps & React.RefAttributes<HTMLInputElement>>;
export default Radio;
//# sourceMappingURL=radio.d.ts.map