import React from 'react';
declare const spinnerSizes: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
};
export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
    size?: keyof typeof spinnerSizes;
    label?: string;
}
export declare const Spinner: React.ForwardRefExoticComponent<SpinnerProps & React.RefAttributes<HTMLDivElement>>;
export default Spinner;
//# sourceMappingURL=Spinner.d.ts.map