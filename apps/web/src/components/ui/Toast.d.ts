import React from 'react';
type ToastType = 'success' | 'error' | 'warning' | 'info';
export interface ToastItem {
    id: string;
    type: ToastType;
    title?: string;
    description?: string;
    duration?: number;
    action?: React.ReactNode;
}
interface ToastContextValue {
    toast: (options: Omit<ToastItem, 'id'>) => void;
    dismiss: (id: string) => void;
}
export declare const useToast: () => ToastContextValue;
export declare const ToastProvider: ({ children }: {
    children: React.ReactNode;
}) => React.JSX.Element;
export declare const Toast: React.ForwardRefExoticComponent<ToastItem & {
    className?: string;
} & React.RefAttributes<HTMLDivElement>>;
export {};
//# sourceMappingURL=Toast.d.ts.map