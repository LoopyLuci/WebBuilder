/**
 * WebBuilder Components - Form Component
 * A form wrapper with layout, validation, and submission handling.
 */
import React from 'react';
export type FormLayout = 'vertical' | 'horizontal' | 'inline';
export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
    layout?: FormLayout;
    spacing?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
}
export declare const Form: React.ForwardRefExoticComponent<FormProps & React.RefAttributes<HTMLFormElement>>;
export default Form;
//# sourceMappingURL=form.d.ts.map