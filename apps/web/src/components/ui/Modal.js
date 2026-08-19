import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
export const Modal = forwardRef(({ className, open, onClose, closeOnOverlay = true, closeOnEscape = true, children, ...props }, ref) => {
    const dialogRef = useRef(null);
    const previousFocusRef = useRef(null);
    useEffect(() => {
        if (open) {
            previousFocusRef.current = document.activeElement;
            dialogRef.current?.focus();
            document.body.style.overflow = 'hidden';
        }
        else {
            document.body.style.overflow = '';
            previousFocusRef.current?.focus();
        }
        return () => { document.body.style.overflow = ''; };
    }, [open]);
    const handleKeyDown = useCallback((e) => {
        if (closeOnEscape && e.key === 'Escape')
            onClose();
        // Focus trap
        if (e.key === 'Tab' && dialogRef.current) {
            const focusable = dialogRef.current.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey) {
                if (document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                }
            }
            else {
                if (document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        }
    }, [onClose, closeOnEscape]);
    const handleOverlayClick = (e) => {
        if (closeOnOverlay && e.target === e.currentTarget)
            onClose();
    };
    if (!open)
        return null;
    return (_jsxs("div", { role: "dialog", "aria-modal": "true", "aria-hidden": !open, ref: ref, className: "fixed inset-0 z-50 flex items-center justify-center", children: [_jsx("div", { className: "fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in", onClick: handleOverlayClick, "aria-hidden": "true" }), _jsx("div", { ref: dialogRef, tabIndex: -1, onKeyDown: handleKeyDown, className: cn('relative z-50 w-full max-w-lg max-h-[85vh] overflow-y-auto', 'rounded-xl border border-border bg-background shadow-xl', 'animate-scale-in', className), ...props, children: children })] }));
});
Modal.displayName = 'Modal';
export const ModalHeader = forwardRef(({ className, showClose = true, onClose, children, ...props }, ref) => (_jsxs("div", { ref: ref, className: cn('flex items-center justify-between border-b border-border p-4', className), ...props, children: [_jsx("div", { className: "font-semibold text-foreground", children: children }), showClose && (_jsx("button", { onClick: onClose, className: "rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors", "aria-label": "Close dialog", children: _jsx("svg", { className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) }))] })));
ModalHeader.displayName = 'ModalHeader';
export const ModalBody = forwardRef(({ className, ...props }, ref) => (_jsx("div", { ref: ref, className: cn('p-4', className), ...props })));
ModalBody.displayName = 'ModalBody';
export const ModalFooter = forwardRef(({ className, ...props }, ref) => (_jsx("div", { ref: ref, className: cn('flex justify-end gap-2 border-t border-border p-4', className), ...props })));
ModalFooter.displayName = 'ModalFooter';
//# sourceMappingURL=Modal.js.map