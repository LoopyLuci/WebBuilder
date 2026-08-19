'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
export const List = ({ items, variant = 'default', size = 'md', onClick, className = '', }) => {
    const sizes = {
        sm: 'py-2',
        md: 'py-3',
        lg: 'py-4',
    };
    const variants = {
        default: 'border-b border-border last:border-0',
        bordered: 'border border-border rounded-lg mb-2 last:mb-0',
        separated: 'mb-2 last:mb-0',
    };
    return (_jsx("div", { className: `divide-y divide-border ${className}`, role: "list", children: items.map(item => {
            const content = (_jsxs(_Fragment, { children: [(item.icon || item.avatar) && (_jsx("div", { className: "shrink-0", children: item.avatar ? (_jsx("img", { src: item.avatar, alt: "", className: "w-10 h-10 rounded-full" })) : (_jsx("div", { className: "w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg", children: item.icon })) })), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "font-medium truncate", children: item.title }), item.badge && (_jsx("span", { className: "px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded", children: item.badge }))] }), item.description && (_jsx("p", { className: "text-sm text-muted-foreground truncate", children: item.description })), item.meta && (_jsx("p", { className: "text-xs text-muted-foreground", children: item.meta }))] }), item.actions && _jsx("div", { className: "shrink-0", children: item.actions })] }));
            if (item.href) {
                return (_jsx("a", { href: item.href, onClick: () => onClick?.(item), className: `flex items-center gap-3 px-3 ${sizes[size]} ${variants[variant]} hover:bg-muted/50 transition-colors`, role: "listitem", children: content }, item.id));
            }
            return (_jsx("div", { onClick: () => onClick?.(item), className: `flex items-center gap-3 px-3 ${sizes[size]} ${variants[variant]} ${onClick ? 'cursor-pointer hover:bg-muted/50' : ''} transition-colors`, role: "listitem", children: content }, item.id));
        }) }));
};
export default List;
//# sourceMappingURL=list.js.map