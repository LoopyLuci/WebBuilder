'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
export function Table({ columns, data, keyExtractor, sortable = false, paginated = false, pageSize = 10, selectable = false, selectedKeys = [], onSelectionChange, emptyMessage = 'No data available', className = '', }) {
    const [sortKey, setSortKey] = React.useState(null);
    const [sortDir, setSortDir] = React.useState('asc');
    const [page, setPage] = React.useState(0);
    const sorted = React.useMemo(() => {
        if (!sortable || !sortKey)
            return data;
        return [...data].sort((a, b) => {
            const aVal = a[sortKey];
            const bVal = b[sortKey];
            if (aVal < bVal)
                return sortDir === 'asc' ? -1 : 1;
            if (aVal > bVal)
                return sortDir === 'asc' ? 1 : -1;
            return 0;
        });
    }, [data, sortKey, sortDir, sortable]);
    const paged = React.useMemo(() => {
        if (!paginated)
            return sorted;
        return sorted.slice(page * pageSize, (page + 1) * pageSize);
    }, [sorted, paginated, page, pageSize]);
    const totalPages = Math.ceil(sorted.length / pageSize);
    const handleSort = (key) => {
        if (sortKey === key) {
            setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        }
        else {
            setSortKey(key);
            setSortDir('asc');
        }
    };
    const toggleSelect = (key) => {
        if (!onSelectionChange)
            return;
        if (selectedKeys.includes(key)) {
            onSelectionChange(selectedKeys.filter(k => k !== key));
        }
        else {
            onSelectionChange([...selectedKeys, key]);
        }
    };
    return (_jsxs("div", { className: `overflow-x-auto ${className}`, children: [_jsxs("table", { className: "w-full text-sm", role: "grid", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-border", children: [selectable && (_jsx("th", { className: "px-4 py-3 text-left", children: _jsx("input", { type: "checkbox", checked: selectedKeys.length === data.length && data.length > 0, onChange: () => {
                                            if (selectedKeys.length === data.length) {
                                                onSelectionChange?.([]);
                                            }
                                            else {
                                                onSelectionChange?.(data.map(keyExtractor));
                                            }
                                        }, className: "rounded", "aria-label": "Select all" }) })), columns.map(col => (_jsxs("th", { className: `px-4 py-3 text-left font-medium text-muted-foreground ${sortable && col.sortable !== false ? 'cursor-pointer hover:text-foreground select-none' : ''} ${col.className || ''}`, onClick: () => col.sortable !== false && handleSort(col.key), "aria-sort": sortKey === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined, children: [col.header, sortable && col.sortable !== false && sortKey === col.key && (_jsx("span", { className: "ml-1", children: sortDir === 'asc' ? '↑' : '↓' }))] }, col.key)))] }) }), _jsx("tbody", { children: paged.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: columns.length + (selectable ? 1 : 0), className: "px-4 py-8 text-center text-muted-foreground", children: emptyMessage }) })) : (paged.map(item => {
                            const key = keyExtractor(item);
                            return (_jsxs("tr", { className: "border-b border-border hover:bg-muted/50", children: [selectable && (_jsx("td", { className: "px-4 py-3", children: _jsx("input", { type: "checkbox", checked: selectedKeys.includes(key), onChange: () => toggleSelect(key), className: "rounded", "aria-label": `Select ${key}` }) })), columns.map(col => (_jsx("td", { className: `px-4 py-3 ${col.className || ''}`, children: col.render ? col.render(item) : item[col.key] }, col.key)))] }, key));
                        })) })] }), paginated && totalPages > 1 && (_jsxs("div", { className: "flex items-center justify-between px-4 py-3 border-t border-border", children: [_jsxs("span", { className: "text-sm text-muted-foreground", children: ["Page ", page + 1, " of ", totalPages] }), _jsxs("div", { className: "flex gap-1", children: [_jsx("button", { onClick: () => setPage(p => Math.max(0, p - 1)), disabled: page === 0, className: "px-3 py-1 rounded border border-border disabled:opacity-50 hover:bg-muted", children: "Previous" }), _jsx("button", { onClick: () => setPage(p => Math.min(totalPages - 1, p + 1)), disabled: page >= totalPages - 1, className: "px-3 py-1 rounded border border-border disabled:opacity-50 hover:bg-muted", children: "Next" })] })] }))] }));
}
export default Table;
//# sourceMappingURL=table.js.map