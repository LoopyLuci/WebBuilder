'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const Chart = ({ data, type = 'bar', height = 200, showGrid = true, showValues = true, className = '', }) => {
    const maxValue = Math.max(...data.map(d => d.value));
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-purple-500', 'bg-cyan-500', 'bg-pink-500', 'bg-orange-500'];
    if (type === 'bar') {
        return (_jsxs("div", { className: `flex items-end gap-2 ${className}`, style: { height }, role: "img", "aria-label": "Bar chart", children: [showGrid && (_jsx("div", { className: "absolute inset-0 flex flex-col justify-between pointer-events-none", "aria-hidden": "true", children: [0, 25, 50, 75, 100].map(pct => (_jsx("div", { className: "border-t border-border w-full" }, pct))) })), data.map((point, i) => (_jsxs("div", { className: "flex-1 flex flex-col items-center gap-1", children: [showValues && (_jsx("span", { className: "text-xs text-muted-foreground", children: point.value })), _jsx("div", { className: `w-full rounded-t transition-all ${point.color || colors[i % colors.length]}`, style: { height: `${(point.value / maxValue) * 100}%` }, role: "img", "aria-label": `${point.label}: ${point.value}` }), _jsx("span", { className: "text-xs text-muted-foreground truncate max-w-full", children: point.label })] }, point.label)))] }));
    }
    if (type === 'line') {
        const points = data.map((point, i) => ({
            x: data.length > 1 ? (i / (data.length - 1)) * 100 : 50,
            y: 100 - (point.value / maxValue) * 100,
        }));
        const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
        return (_jsx("div", { className: className, style: { height }, role: "img", "aria-label": "Line chart", children: _jsxs("svg", { viewBox: "0 0 100 100", className: "w-full h-full", preserveAspectRatio: "none", children: [showGrid && (_jsx("g", { "aria-hidden": "true", children: [0, 25, 50, 75, 100].map(y => (_jsx("line", { x1: "0", y1: y, x2: "100", y2: y, stroke: "currentColor", strokeOpacity: "0.1" }, y))) })), _jsx("path", { d: pathD, fill: "none", stroke: "currentColor", strokeWidth: "2", className: "text-blue-500" }), points.map((p, i) => (_jsx("circle", { cx: p.x, cy: p.y, r: "2", fill: "currentColor", className: "text-blue-500" }, i)))] }) }));
    }
    // Pie chart
    const total = data.reduce((sum, d) => sum + d.value, 0);
    let currentAngle = 0;
    return (_jsx("div", { className: className, style: { height }, role: "img", "aria-label": "Pie chart", children: _jsx("svg", { viewBox: "0 0 100 100", className: "w-full h-full", children: data.map((point, i) => {
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
                return (_jsx("path", { d: `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`, className: colorClass, "aria-label": `${point.label}: ${point.value}` }, point.label));
            }) }) }));
};
export default Chart;
//# sourceMappingURL=chart.js.map