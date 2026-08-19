'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';

interface DropZoneProps {
  id: string;
  isOver: boolean;
  children?: React.ReactNode;
}

export function DropZone({ id, isOver, children }: DropZoneProps) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[200px] rounded-lg transition-all ${
        isOver
          ? 'border-2 border-dashed border-primary-500 bg-primary-50/50'
          : 'border-2 border-dashed border-transparent'
      }`}
    >
      {children}
    </div>
  );
}

export default DropZone;
