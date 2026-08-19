/**
 * WebBuilder Components - Alert Component
 * A flexible alert component with multiple variants and dismiss support.
 */
import React from 'react';
export type AlertVariant = 'info' | 'success' | 'warning' | 'error';
export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: AlertVariant;
    title?: string;
    icon?: React.ReactNode;
    dismissible?: boolean;
    onDismiss?: () => void;
    action?: React.ReactNode;
}
export declare const Alert: React.ForwardRefExoticComponent<AlertProps & React.RefAttributes<HTMLDivElement>>;
export default Alert;
//# sourceMappingURL=alert.d.ts.map