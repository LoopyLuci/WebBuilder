'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
export const Calendar = ({ value, onChange, minDate, maxDate, disabledDates = [], className = '', }) => {
    const [currentMonth, setCurrentMonth] = React.useState(() => {
        const d = value || new Date();
        return new Date(d.getFullYear(), d.getMonth(), 1);
    });
    const [selected, setSelected] = React.useState(value);
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const firstDayOfWeek = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
    const days = [];
    for (let i = 0; i < firstDayOfWeek; i++)
        days.push(null);
    for (let i = 1; i <= daysInMonth; i++)
        days.push(i);
    const isDisabled = (day) => {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        if (minDate && date < minDate)
            return true;
        if (maxDate && date > maxDate)
            return true;
        return disabledDates.some(d => d.toDateString() === date.toDateString());
    };
    const isSelected = (day) => {
        if (!selected)
            return false;
        return new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toDateString() === selected.toDateString();
    };
    const isToday = (day) => {
        const today = new Date();
        return new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toDateString() === today.toDateString();
    };
    const handleSelect = (day) => {
        if (isDisabled(day))
            return;
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        setSelected(date);
        onChange?.(date);
    };
    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };
    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    return (_jsxs("div", { className: `w-full max-w-xs bg-background rounded-xl border border-border p-4 ${className}`, role: "application", "aria-label": "Calendar", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("button", { onClick: prevMonth, className: "p-1 rounded hover:bg-muted", "aria-label": "Previous month", children: _jsx("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 19l-7-7 7-7" }) }) }), _jsxs("span", { className: "font-medium", children: [monthNames[currentMonth.getMonth()], " ", currentMonth.getFullYear()] }), _jsx("button", { onClick: nextMonth, className: "p-1 rounded hover:bg-muted", "aria-label": "Next month", children: _jsx("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) }) })] }), _jsx("div", { className: "grid grid-cols-7 gap-1 mb-2", children: dayNames.map(d => (_jsx("div", { className: "text-center text-xs text-muted-foreground py-1", "aria-hidden": "true", children: d }, d))) }), _jsx("div", { className: "grid grid-cols-7 gap-1", children: days.map((day, i) => (_jsx("div", { className: "aspect-square", children: day !== null ? (_jsx("button", { onClick: () => handleSelect(day), disabled: isDisabled(day), className: `w-full h-full rounded-lg text-sm flex items-center justify-center transition-colors ${isSelected(day)
                            ? 'bg-blue-600 text-white'
                            : isToday(day)
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                : isDisabled(day)
                                    ? 'text-muted-foreground opacity-50 cursor-not-allowed'
                                    : 'hover:bg-muted'}`, "aria-label": `${monthNames[currentMonth.getMonth()]} ${day}${isToday(day) ? ' (today)' : ''}`, "aria-pressed": isSelected(day), children: day })) : (_jsx("div", {})) }, i))) })] }));
};
export default Calendar;
//# sourceMappingURL=calendar.js.map