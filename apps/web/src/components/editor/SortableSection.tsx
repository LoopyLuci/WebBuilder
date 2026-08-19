'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableSectionProps {
  id: string;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  children: React.ReactNode;
}

export function SortableSection({ id, isSelected, onSelect, onRemove, children }: SortableSectionProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      onClick={onSelect}
      className={`relative cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-primary-500 ring-offset-2' : 'hover:ring-1 hover:ring-primary-300'
      } ${isDragging ? 'shadow-lg' : ''}`}
    >
      <div {...listeners} className="absolute left-2 top-2 cursor-grab active:cursor-grabbing p-1 rounded bg-muted/80 hover:bg-muted" aria-label="Drag to reorder">
        <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </div>
      {children}
      {isSelected && (
        <div className="absolute top-2 right-2 flex gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="p-1 rounded bg-red-500 text-white text-xs hover:bg-red-600"
            aria-label="Remove section"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

export default SortableSection;
