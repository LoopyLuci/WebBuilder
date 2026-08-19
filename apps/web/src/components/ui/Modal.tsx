import React, { forwardRef, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

export interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  open: boolean;
  onClose: () => void;
  closeOnOverlay?: boolean;
  closeOnEscape?: boolean;
  children: React.ReactNode;
}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ className, open, onClose, closeOnOverlay = true, closeOnEscape = true, children, ...props }, ref) => {
    const dialogRef = useRef<HTMLDivElement>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
      if (open) {
        previousFocusRef.current = document.activeElement as HTMLElement;
        dialogRef.current?.focus();
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
        previousFocusRef.current?.focus();
      }
      return () => { document.body.style.overflow = ''; };
    }, [open]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
      if (closeOnEscape && e.key === 'Escape') onClose();

      // Focus trap
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    }, [onClose, closeOnEscape]);

    const handleOverlayClick = (e: React.MouseEvent) => {
      if (closeOnOverlay && e.target === e.currentTarget) onClose();
    };

    if (!open) return null;

    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        ref={ref}
        className="fixed inset-0 z-50 flex items-center justify-center"
      >
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
        {/* Content */}
        <div
          ref={dialogRef}
          tabIndex={-1}
          onKeyDown={handleKeyDown}
          className={cn(
            'relative z-50 w-full max-w-lg max-h-[85vh] overflow-y-auto',
            'rounded-xl border border-border bg-background shadow-xl',
            'animate-scale-in',
            className
          )}
          {...props}
        >
          {children}
        </div>
      </div>
    );
  }
);

Modal.displayName = 'Modal';

export interface ModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  showClose?: boolean;
  onClose?: () => void;
}

export const ModalHeader = forwardRef<HTMLDivElement, ModalHeaderProps>(
  ({ className, showClose = true, onClose, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center justify-between border-b border-border p-4', className)}
      {...props}
    >
      <div className="font-semibold text-foreground">{children}</div>
      {showClose && (
        <button
          onClick={onClose}
          className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Close dialog"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
);

ModalHeader.displayName = 'ModalHeader';

export const ModalBody = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-4', className)} {...props} />
  )
);

ModalBody.displayName = 'ModalBody';

export const ModalFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex justify-end gap-2 border-t border-border p-4', className)}
      {...props}
    />
  )
);

ModalFooter.displayName = 'ModalFooter';