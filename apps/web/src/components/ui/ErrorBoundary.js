'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Component } from 'react';
export class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo);
        this.props.onError?.(error, errorInfo);
    }
    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };
    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }
            return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-background p-4", children: _jsxs("div", { className: "max-w-md w-full text-center", children: [_jsx("div", { className: "w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center", children: _jsx("svg", { className: "w-8 h-8 text-red-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" }) }) }), _jsx("h2", { className: "text-xl font-semibold mb-2", children: "Something went wrong" }), _jsx("p", { className: "text-muted-foreground mb-6", children: "An unexpected error occurred. Don't worry, your work is safe." }), _jsxs("div", { className: "flex gap-3 justify-center", children: [_jsx("button", { onClick: this.handleReset, className: "px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors", children: "Try Again" }), _jsx("button", { onClick: () => window.location.reload(), className: "px-4 py-2 border border-border rounded-lg font-medium hover:bg-muted transition-colors", children: "Reload Page" })] }), this.state.error && (_jsxs("details", { className: "mt-6 text-left", children: [_jsx("summary", { className: "text-sm text-muted-foreground cursor-pointer hover:text-foreground", children: "Technical details" }), _jsx("pre", { className: "mt-2 p-3 bg-muted rounded-lg text-xs text-muted-foreground overflow-auto max-h-40", children: this.state.error.message })] }))] }) }));
        }
        return this.props.children;
    }
}
export default ErrorBoundary;
//# sourceMappingURL=ErrorBoundary.js.map