'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { useDroppable } from '@dnd-kit/core';
export function DropZone({ id, isOver, children }) {
    const { setNodeRef } = useDroppable({ id });
    return (_jsx("div", { ref: setNodeRef, className: `min-h-[200px] rounded-lg transition-all ${isOver
            ? 'border-2 border-dashed border-primary-500 bg-primary-50/50'
            : 'border-2 border-dashed border-transparent'}`, children: children }));
}
export default DropZone;
//# sourceMappingURL=DropZone.js.map