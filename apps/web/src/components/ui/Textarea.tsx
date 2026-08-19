import React, { forwardRef, useId, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'rows'> {
  label?: string;
  error?: string;
  helperText?: string;
  autoResize?: boolean;
  rows?: number;
  maxRows?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, id, label, error, helperText, autoResize = false, rows = 3, maxRows = 10, disabled, value, onChange, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id || generatedId;
    const helperId = helperText ? `${textareaId}-helper` : undefined;
    const errorId = error ? `${textareaId}-error` : undefined;
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const setRefs = useCallback((node: HTMLTextAreaElement | null) => {
      (textareaRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
    }, [ref]);

    useEffect(() => {
      if (!autoResize || !textareaRef.current) return;
      const el = textareaRef.current;
      const resize = () => {
        el.style.height = 'auto';
        const lineHeight = parseInt(getComputedStyle(el).lineHeight) || 20;
        const maxHeight = lineHeight * maxRows;
        el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
      };
      resize();
      el.addEventListener('input', resize);
      return () => el.removeEventListener('input', resize);
    }, [autoResize, maxRows]);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className={cn(
              'mb-1.5 block text-sm font-medium',
              error ? 'text-error-500' : 'text-foreground',
              disabled && 'opacity-50'
            )}
          >
            {label}
          </label>
        )}
        <textarea
          ref={setRefs}
          id={textareaId}
          rows={rows}
          disabled={disabled}
          value={value}
          onChange={onChange}
          aria-invalid={!!error}
          aria-describedby={cn(helperId, errorId) || undefined}
          className={cn(
            'w-full rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:border-transparent',
            'transition-shadow duration-150 resize-none',
            error ? 'border-error-500 focus-visible:ring-error-500' : 'border-border',
            disabled && 'cursor-not-allowed opacity-50',
            className
          )}
          {...props}
        />
        {error && (
          <p id={errorId} role="alert" className="mt-1.5 text-xs text-error-500">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="mt-1.5 text-xs text-muted-foreground">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
export default Textarea;