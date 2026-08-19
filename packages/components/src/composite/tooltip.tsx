/**
 * WebBuilder Components - Tooltip Component
 * A hover-triggered tooltip with positioning support.
 */

import React, { useState, useRef } from 'react';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps extends React.HTMLAttributes<HTMLDivElement> {
  content: React.ReactNode;
  position?: TooltipPosition;
  delay?: number;
  disabled?: boolean;
  children: React.ReactNode;
}

const positionStyles: Record<TooltipPosition, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

const arrowStyles: Record<TooltipPosition, string> = {
  top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-900 border-x-transparent border-b-transparent',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-900 border-x-transparent border-t-transparent',
  left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-900 border-y-transparent border-r-transparent',
  right: 'right-full top-1/2 -translate-y-1/2 border-r-gray-900 border-y-transparent border-l-transparent',
};

export const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  (
    {
      content,
      position = 'top',
      delay = 200,
      disabled = false,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const [visible, setVisible] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const show = () => {
      if (disabled) return;
      timeoutRef.current = setTimeout(() => setVisible(true), delay);
    };

    const hide = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setVisible(false);
    };

    return (
      <div
        ref={ref}
        className={['relative inline-flex', className].filter(Boolean).join(' ')}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        {...props}
      >
        {children}
        {visible && !disabled && (
          <div
            role="tooltip"
            className={[
              'absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg whitespace-nowrap animate-[fadeIn_0.15s_ease-out]',
              positionStyles[position],
            ].join(' ')}
          >
            {content}
            <span
              className={[
                'absolute w-0 h-0 border-4',
                arrowStyles[position],
              ].join(' ')}
            />
          </div>
        )}
      </div>
    );
  }
);

Tooltip.displayName = 'Tooltip';

export default Tooltip;