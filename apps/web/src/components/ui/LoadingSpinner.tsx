'use client';

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export function LoadingSpinner({ size = 'md', label }: LoadingSpinnerProps) {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3" role="status">
      <div
        className={`${sizes[size]} rounded-full border-primary-200 border-t-primary-600 animate-spin`}
      />
      {label && <p className="text-sm text-muted-foreground">{label}</p>}
    </div>
  );
}

export default LoadingSpinner;
