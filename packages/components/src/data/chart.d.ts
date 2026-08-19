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
export declare const Chart: React.FC<ChartProps>;
export default Chart;
//# sourceMappingURL=chart.d.ts.map