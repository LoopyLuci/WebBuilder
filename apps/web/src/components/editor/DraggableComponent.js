'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
export function DraggableComponent({ id, type, name, icon, category, onClick }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id,
        data: { type, name },
    });
    const style = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : 1,
    };
    return (_jsxs("button", { ref: setNodeRef, style: style, ...listeners, ...attributes, onClick: onClick, className: `w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-left transition-all cursor-grab active:cursor-grabbing ${isDragging ? 'bg-primary-100 shadow-lg ring-2 ring-primary-500' : 'hover:bg-muted border border-transparent hover:border-border'}`, children: [_jsx("span", { className: "text-xl", children: icon }), _jsxs("div", { children: [_jsx("div", { className: "font-medium", children: name }), _jsx("div", { className: "text-xs text-muted-foreground", children: category })] })] }));
}
export default DraggableComponent;
//# sourceMappingURL=DraggableComponent.js.map