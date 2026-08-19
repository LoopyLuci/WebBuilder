'use client';

import React from 'react';

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp?: string;
  icon?: React.ReactNode;
  status?: 'completed' | 'current' | 'pending';
  meta?: React.ReactNode;
}

export interface TimelineProps {
  items: TimelineItem[];
  variant?: 'default' | 'compact';
  className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({
  items,
  variant = 'default',
  className = '',
}) => {
  const dotColors = {
    completed: 'bg-green-500',
    current: 'bg-blue-500 ring-4 ring-blue-100 dark:ring-blue-900',
    pending: 'bg-gray-300 dark:bg-gray-700',
  };

  return (
    <div className={`relative ${className}`} role="list">
      {variant === 'default' && (
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" aria-hidden="true" />
      )}
      {items.map((item, index) => (
        <div key={item.id} className="relative flex gap-4 pb-6 last:pb-0" role="listitem">
          {variant === 'default' && (
            <div className="relative z-10 shrink-0">
              {item.icon ? (
                <div className="w-8 h-8 rounded-full bg-background border-2 border-border flex items-center justify-center text-sm">
                  {item.icon}
                </div>
              ) : (
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${dotColors[item.status || 'pending']}`}>
                  {item.status === 'completed' && (
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              )}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium">{item.title}</span>
              {item.timestamp && (
                <span className="text-xs text-muted-foreground">{item.timestamp}</span>
              )}
            </div>
            {item.description && variant === 'default' && (
              <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
            )}
            {item.meta && <div className="mt-2">{item.meta}</div>}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Timeline;
