'use client';

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

interface DraggableComponentProps {
  id: string;
  type: string;
  name: string;
  icon: string;
  category: string;
  onClick: () => void;
}

export function DraggableComponent({ id, type, name, icon, category, onClick }: DraggableComponentProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    data: { type, name },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <button
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-left transition-all cursor-grab active:cursor-grabbing ${
        isDragging ? 'bg-primary-100 shadow-lg ring-2 ring-primary-500' : 'hover:bg-muted border border-transparent hover:border-border'
      }`}
    >
      <span className="text-xl">{icon}</span>
      <div>
        <div className="font-medium">{name}</div>
        <div className="text-xs text-muted-foreground">{category}</div>
      </div>
    </button>
  );
}

export default DraggableComponent;
