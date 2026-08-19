'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef, useMemo } from 'react';
export function CommandPalette({ commands, isOpen, onClose }) {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);
    const listRef = useRef(null);
    // Fuzzy search
    const filteredCommands = useMemo(() => {
        if (!query.trim())
            return commands;
        const lowerQuery = query.toLowerCase();
        return commands
            .filter(cmd => cmd.label.toLowerCase().includes(lowerQuery) ||
            cmd.description?.toLowerCase().includes(lowerQuery) ||
            cmd.category.toLowerCase().includes(lowerQuery))
            .sort((a, b) => {
            // Prioritize exact matches
            const aExact = a.label.toLowerCase().startsWith(lowerQuery) ? 0 : 1;
            const bExact = b.label.toLowerCase().startsWith(lowerQuery) ? 0 : 1;
            return aExact - bExact;
        });
    }, [query, commands]);
    // Reset state when opening
    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);
    // Scroll selected item into view
    useEffect(() => {
        if (listRef.current) {
            const selected = listRef.current.children[selectedIndex];
            selected?.scrollIntoView({ block: 'nearest' });
        }
    }, [selectedIndex]);
    // Keyboard navigation
    const handleKeyDown = (e) => {
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(i => Math.min(i + 1, filteredCommands.length - 1));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(i => Math.max(i - 1, 0));
                break;
            case 'Enter':
                e.preventDefault();
                filteredCommands[selectedIndex]?.action();
                onClose();
                break;
            case 'Escape':
                e.preventDefault();
                onClose();
                break;
        }
    };
    if (!isOpen)
        return null;
    return (_jsxs("div", { className: "fixed inset-0 z-[200] flex items-start justify-center pt-[15vh]", children: [_jsx("div", { className: "absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in", onClick: onClose }), _jsxs("div", { className: "relative w-full max-w-lg bg-background rounded-xl shadow-2xl border border-border overflow-hidden animate-scale-in", children: [_jsxs("div", { className: "flex items-center gap-3 px-4 py-3 border-b border-border", children: [_jsx("svg", { className: "w-5 h-5 text-muted-foreground shrink-0", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" }) }), _jsx("input", { ref: inputRef, type: "text", value: query, onChange: (e) => { setQuery(e.target.value); setSelectedIndex(0); }, onKeyDown: handleKeyDown, placeholder: "Type a command...", className: "flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none" }), _jsx("kbd", { className: "px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground bg-muted rounded", children: "ESC" })] }), _jsx("div", { ref: listRef, className: "max-h-[50vh] overflow-auto py-2", children: filteredCommands.length === 0 ? (_jsx("div", { className: "px-4 py-8 text-center text-sm text-muted-foreground", children: "No commands found" })) : (filteredCommands.map((cmd, index) => (_jsxs("button", { onClick: () => { cmd.action(); onClose(); }, className: `w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${index === selectedIndex ? 'bg-primary-50 dark:bg-primary-900/20' : 'hover:bg-muted'}`, children: [cmd.icon && _jsx("span", { className: "text-lg shrink-0", children: cmd.icon }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("div", { className: "text-sm font-medium truncate", children: cmd.label }), cmd.description && (_jsx("div", { className: "text-xs text-muted-foreground truncate", children: cmd.description }))] }), _jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [_jsx("span", { className: "text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded", children: cmd.category }), cmd.shortcut && (_jsx("kbd", { className: "px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground bg-muted rounded", children: cmd.shortcut }))] })] }, cmd.id)))) }), _jsxs("div", { className: "flex items-center gap-4 px-4 py-2 border-t border-border bg-muted/50 text-[10px] text-muted-foreground", children: [_jsx("span", { children: "\u2191\u2193 Navigate" }), _jsx("span", { children: "\u21B5 Select" }), _jsx("span", { children: "ESC Close" })] })] })] }));
}
export default CommandPalette;
//# sourceMappingURL=CommandPalette.js.map