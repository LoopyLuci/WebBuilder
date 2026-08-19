import React, { forwardRef, useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
}

const tooltipPositions = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

const tooltipArrows = {
  top: 'top-full left-1/2 -translate-x-1/2 border-t-foreground',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-foreground',
  left: 'left-full top-1/2 -translate-y-1/2 border-l-foreground',
  right: 'right-full top-1/2 -translate-y-1/2 border-r-foreground',
};

export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  ({ children, content, side = 'top', delay = 200, className }, ref) => {
    const [visible, setVisible] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const tooltipId = React.useId();

    const show = () => {
      timeoutRef.current = setTimeout(() => setVisible(true), delay);
    };
    const hide = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setVisible(false);
    };

    useEffect(() => {
      return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
    }, []);

    return (
      <div ref={ref} className={cn('relative inline-flex', className)}>
        <div
          aria-describedby={visible ? tooltipId : undefined}
          onMouseEnter={show}
          onMouseLeave={hide}
          onFocus={show}
          onBlur={hide}
        >
          {children}
        </div>
        {visible && (
          <div
            id={tooltipId}
            role="tooltip"
            className={cn(
              'absolute z-50 whitespace-nowrap rounded-md bg-foreground px-2.5 py-1.5',
              'text-xs text-background shadow-md animate-fade-in',
              'pointer-events-none',
              tooltipPositions[side]
            )}
          >
            {content}
            <span
              className={cn(
                'absolute border-4 border-transparent',
                tooltipArrows[side]
              )}
              aria-hidden="true"
            />
          </div>
        )}
      </div>
    );
  }
);

Tooltip.displayName = 'Tooltip';
export default Tooltip;