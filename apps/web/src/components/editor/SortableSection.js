'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
export function SortableSection({ id, isSelected, onSelect, onRemove, children }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };
    return (_jsxs("div", { ref: setNodeRef, style: style, ...attributes, onClick: onSelect, className: `relative cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary-500 ring-offset-2' : 'hover:ring-1 hover:ring-primary-300'} ${isDragging ? 'shadow-lg' : ''}`, children: [_jsx("div", { ...listeners, className: "absolute left-2 top-2 cursor-grab active:cursor-grabbing p-1 rounded bg-muted/80 hover:bg-muted", "aria-label": "Drag to reorder", children: _jsx("svg", { className: "w-4 h-4 text-muted-foreground", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 8h16M4 16h16" }) }) }), children, isSelected && (_jsx("div", { className: "absolute top-2 right-2 flex gap-1", children: _jsx("button", { onClick: (e) => { e.stopPropagation(); onRemove(); }, className: "p-1 rounded bg-red-500 text-white text-xs hover:bg-red-600", "aria-label": "Remove section", children: "\u2715" }) }))] }));
}
export default SortableSection;
//# sourceMappingURL=SortableSection.js.map