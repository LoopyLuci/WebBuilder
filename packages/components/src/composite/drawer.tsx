/**
 * WebBuilder Components - Drawer Component
 * A slide-out panel from any edge of the screen.
 */

import React, { useEffect, useCallback } from 'react';

export type DrawerPosition = 'left' | 'right' | 'top' | 'bottom';
export type DrawerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface DrawerProps extends React.HTMLAttributes<HTMLDivElement> {
  open: boolean;
  onClose: () => void;
  position?: DrawerPosition;
  size?: DrawerSize;
  title?: string;
  description?: string;
  closeOnOverlay?: boolean;
  closeOnEsc?: boolean;
  showCloseButton?: boolean;
  footer?: React.ReactNode;
}

const sizeStyles: Record<DrawerPosition, Record<DrawerSize, string>> = {
  left: {
    sm: 'max-w-xs',
    md: 'max-w-sm',
    lg: 'max-w-md',
    xl: 'max-w-lg',
    full: 'max-w-full',
  },
  right: {
    sm: 'max-w-xs',
    md: 'max-w-sm',
    lg: 'max-w-md',
    xl: 'max-w-lg',
    full: 'max-w-full',
  },
  top: {
    sm: 'max-h-48',
    md: 'max-h-72',
    lg: 'max-h-96',
    xl: 'max-h-[32rem]',
    full: 'max-h-full',
  },
  bottom: {
    sm: 'max-h-48',
    md: 'max-h-72',
    lg: 'max-h-96',
    xl: 'max-h-[32rem]',
    full: 'max-h-full',
  },
};

const positionClasses: Record<DrawerPosition, string> = {
  left: 'inset-y-0 left-0 h-full animate-[slideInLeft_0.3s_ease-out]',
  right: 'inset-y-0 right-0 h-full animate-[slideInRight_0.3s_ease-out]',
  top: 'inset-x-0 top-0 w-full animate-[slideInTop_0.3s_ease-out]',
  bottom: 'inset-x-0 bottom-0 w-full animate-[slideInBottom_0.3s_ease-out]',
};

export const Drawer = React.forwardRef<HTMLDivElement, DrawerProps>(
  (
    {
      open,
      onClose,
      position = 'right',
      size = 'md',
      title,
      description,
      closeOnOverlay = true,
      closeOnEsc = true,
      showCloseButton = true,
      footer,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const handleEsc = useCallback(
      (e: KeyboardEvent) => {
        if (e.key === 'Escape' && closeOnEsc) {
          onClose();
        }
      },
      [closeOnEsc, onClose]
    );

    useEffect(() => {
      if (open) {
        document.addEventListener('keydown', handleEsc);
        document.body.style.overflow = 'hidden';
      }
      return () => {
        document.removeEventListener('keydown', handleEsc);
        document.body.style.overflow = '';
      };
    }, [open, handleEsc]);

    if (!open) return null;

    const isHorizontal = position === 'left' || position === 'right';

    return (
      <div
        ref={ref}
        className={['fixed inset-0 z-50', className].filter(Boolean).join(' ')}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'drawer-title' : undefined}
        {...props}
      >
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
          onClick={closeOnOverlay ? onClose : undefined}
          aria-hidden="true"
        />

        {/* Drawer Content */}
        <div
          className={[
            'absolute bg-white shadow-2xl flex flex-col',
            positionClasses[position],
            isHorizontal ? sizeStyles[position][size] + ' w-full' : 'w-full ' + sizeStyles[position][size],
          ].join(' ')}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div>
                {title && (
                  <h2 id="drawer-title" className="text-lg font-semibold text-gray-900">
                    {title}
                  </h2>
                )}
                {description && (
                  <p className="mt-1 text-sm text-gray-500">{description}</p>
                )}
              </div>
              {showCloseButton && (
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Close drawer"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="flex items-center justify-end gap-3 p-4 bg-gray-50 border-t border-gray-200">
              {footer}
            </div>
          )}
        </div>
      </div>
    );
  }
);

Drawer.displayName = 'Drawer';

export default Drawer;