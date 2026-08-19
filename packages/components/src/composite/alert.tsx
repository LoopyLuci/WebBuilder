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

const variantStyles: Record<AlertVariant, { container: string; icon: string; title: string }> = {
  info: {
    container: 'bg-blue-50 border-blue-200',
    icon: 'text-blue-600',
    title: 'text-blue-900',
  },
  success: {
    container: 'bg-green-50 border-green-200',
    icon: 'text-green-600',
    title: 'text-green-900',
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-200',
    icon: 'text-yellow-600',
    title: 'text-yellow-900',
  },
  error: {
    container: 'bg-red-50 border-red-200',
    icon: 'text-red-600',
    title: 'text-red-900',
  },
};

const defaultIcons: Record<AlertVariant, React.ReactNode> = {
  info: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  success: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      variant = 'info',
      title,
      icon,
      dismissible = false,
      onDismiss,
      action,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const styles = variantStyles[variant];
    const displayIcon = icon !== undefined ? icon : defaultIcons[variant];

    return (
      <div
        ref={ref}
        role="alert"
        className={[
          'flex items-start gap-3 p-4 rounded-lg border',
          styles.container,
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        <span className={['flex-shrink-0', styles.icon].join(' ')}>{displayIcon}</span>
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className={['text-sm font-semibold', styles.title].join(' ')}>{title}</h4>
          )}
          {children && (
            <div className={['text-sm text-gray-700', title ? 'mt-1' : ''].join(' ')}>
              {children}
            </div>
          )}
          {action && <div className="mt-3">{action}</div>}
        </div>
        {dismissible && (
          <button
            type="button"
            onClick={onDismiss}
            className="flex-shrink-0 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white/50 transition-colors"
            aria-label="Dismiss"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    );
  }
);

Alert.displayName = 'Alert';

export default Alert;