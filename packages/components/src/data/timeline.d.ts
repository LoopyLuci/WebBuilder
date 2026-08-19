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
export declare const Timeline: React.FC<TimelineProps>;
export default Timeline;
//# sourceMappingURL=timeline.d.ts.map