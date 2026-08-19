'use client';

import React from 'react';

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface ChartProps {
  data: ChartDataPoint[];
  type?: 'bar' | 'line' | 'pie';
  height?: number;
  showGrid?: boolean;
  showValues?: boolean;
  className?: string;
}

export const Chart: React.FC<ChartProps> = ({
  data,
  type = 'bar',
  height = 200,
  showGrid = true,
  showValues = true,
  className = '',
}) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-purple-500', 'bg-cyan-500', 'bg-pink-500', 'bg-orange-500'];

  if (type === 'bar') {
    return (
      <div className={`flex items-end gap-2 ${className}`} style={{ height }} role="img" aria-label="Bar chart">
        {showGrid && (
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none" aria-hidden="true">
            {[0, 25, 50, 75, 100].map(pct => (
              <div key={pct} className="border-t border-border w-full" />
            ))}
          </div>
        )}
        {data.map((point, i) => (
          <div key={point.label} className="flex-1 flex flex-col items-center gap-1">
            {showValues && (
              <span className="text-xs text-muted-foreground">{point.value}</span>
            )}
            <div
              className={`w-full rounded-t transition-all ${point.color || colors[i % colors.length]}`}
              style={{ height: `${(point.value / maxValue) * 100}%` }}
              role="img"
              aria-label={`${point.label}: ${point.value}`}
            />
            <span className="text-xs text-muted-foreground truncate max-w-full">{point.label}</span>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'line') {
    const points = data.map((point, i) => ({
      x: data.length > 1 ? (i / (data.length - 1)) * 100 : 50,
      y: 100 - (point.value / maxValue) * 100,
    }));

    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    return (
      <div className={className} style={{ height }} role="img" aria-label="Line chart">
        <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
          {showGrid && (
            <g aria-hidden="true">
              {[0, 25, 50, 75, 100].map(y => (
                <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="currentColor" strokeOpacity="0.1" />
              ))}
            </g>
          )}
          <path d={pathD} fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-500" />
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="2" fill="currentColor" className="text-blue-500" />
          ))}
        </svg>
      </div>
    );
  }

  // Pie chart
  const total = data.reduce((sum, d) => sum + d.value, 0);
  let currentAngle = 0;

  return (
    <div className={className} style={{ height }} role="img" aria-label="Pie chart">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {data.map((point, i) => {
          const angle = (point.value / total) * 360;
          const startAngle = currentAngle;
          currentAngle += angle;
          const endAngle = currentAngle;

          const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
          const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
          const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
          const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);

          const largeArc = angle > 180 ? 1 : 0;

          const colorClass = colors[i % colors.length]?.replace('bg-', 'fill-') || 'fill-blue-500';
          return (
            <path
              key={point.label}
              d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
              className={colorClass}
              aria-label={`${point.label}: ${point.value}`}
            />
          );
        })}
      </svg>
    </div>
  );
};

export default Chart;
