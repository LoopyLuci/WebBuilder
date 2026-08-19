'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function EmptyState({ icon, title, description, action, secondaryAction }) {
    return (_jsxs("div", { className: "flex flex-col items-center justify-center text-center p-8", children: [icon && (_jsx("div", { className: "w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center text-3xl", children: icon })), _jsx("h3", { className: "text-lg font-semibold mb-2", children: title }), description && (_jsx("p", { className: "text-sm text-muted-foreground mb-6 max-w-sm", children: description })), _jsxs("div", { className: "flex gap-3", children: [action && (_jsx("button", { onClick: action.onClick, className: "px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors", children: action.label })), secondaryAction && (_jsx("button", { onClick: secondaryAction.onClick, className: "px-4 py-2 border border-border rounded-lg font-medium hover:bg-muted transition-colors", children: secondaryAction.label }))] })] }));
}
export default EmptyState;
//# sourceMappingURL=EmptyState.js.map