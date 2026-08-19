import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * WebBuilder Components - DatePicker Component
 * A date picker component with calendar popup.
 */
import React, { useState, useRef, useEffect } from 'react';
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-4 py-3 text-base',
};
export const DatePicker = React.forwardRef(({ label, value, onChange, minDate, maxDate, disabled = false, placeholder = 'Select date', error, helperText, size = 'md', className = '', ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(value ? value.getMonth() : new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(value ? value.getFullYear() : new Date().getFullYear());
    const containerRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    const getDaysInMonth = (month, year) => {
        return new Date(year, month + 1, 0).getDate();
    };
    const getFirstDayOfMonth = (month, year) => {
        return new Date(year, month, 1).getDay();
    };
    const isDateDisabled = (day) => {
        const date = new Date(currentYear, currentMonth, day);
        if (minDate && date < minDate)
            return true;
        if (maxDate && date > maxDate)
            return true;
        return false;
    };
    const isSelected = (day) => {
        if (!value)
            return false;
        return value.getDate() === day && value.getMonth() === currentMonth && value.getFullYear() === currentYear;
    };
    const handleSelectDate = (day) => {
        if (isDateDisabled(day))
            return;
        onChange?.(new Date(currentYear, currentMonth, day));
        setIsOpen(false);
    };
    const prevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        }
        else {
            setCurrentMonth(currentMonth - 1);
        }
    };
    const nextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        }
        else {
            setCurrentMonth(currentMonth + 1);
        }
    };
    const formatDate = (date) => {
        return `${monthNames[date.getMonth()].slice(0, 3)} ${date.getDate()}, ${date.getFullYear()}`;
    };
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    return (_jsxs("div", { ref: containerRef, className: ['flex flex-col gap-1.5', className].filter(Boolean).join(' '), ...props, children: [label && (_jsx("label", { className: "text-sm font-medium text-gray-700", children: label })), _jsxs("div", { className: "relative", children: [_jsxs("button", { type: "button", onClick: () => !disabled && setIsOpen(!isOpen), disabled: disabled, className: [
                            'flex items-center justify-between w-full border rounded-md bg-white text-left transition-colors',
                            sizeStyles[size],
                            'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                            error ? 'border-red-500' : '',
                            disabled ? 'opacity-50 cursor-not-allowed' : '',
                        ].join(' '), children: [_jsx("span", { className: value ? 'text-gray-900' : 'text-gray-400', children: value ? formatDate(value) : placeholder }), _jsx("svg", { className: "w-4 h-4 text-gray-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" }) })] }), isOpen && (_jsxs("div", { className: "absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50 w-72 animate-[fadeIn_0.15s_ease-out]", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("button", { type: "button", onClick: prevMonth, className: "p-1 hover:bg-gray-100 rounded", children: _jsx("svg", { className: "w-5 h-5 text-gray-600", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 19l-7-7 7-7" }) }) }), _jsxs("span", { className: "text-sm font-medium text-gray-900", children: [monthNames[currentMonth], " ", currentYear] }), _jsx("button", { type: "button", onClick: nextMonth, className: "p-1 hover:bg-gray-100 rounded", children: _jsx("svg", { className: "w-5 h-5 text-gray-600", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) }) })] }), _jsx("div", { className: "grid grid-cols-7 gap-1 mb-2", children: dayNames.map((day) => (_jsx("div", { className: "text-xs font-medium text-gray-500 text-center py-1", children: day }, day))) }), _jsxs("div", { className: "grid grid-cols-7 gap-1", children: [Array.from({ length: firstDay }).map((_, i) => (_jsx("div", {}, `empty-${i}`))), Array.from({ length: daysInMonth }).map((_, i) => {
                                        const day = i + 1;
                                        return (_jsx("button", { type: "button", onClick: () => handleSelectDate(day), disabled: isDateDisabled(day), className: [
                                                'w-8 h-8 text-sm rounded-full transition-colors flex items-center justify-center',
                                                isSelected(day) ? 'bg-blue-600 text-white' : 'hover:bg-gray-100',
                                                isDateDisabled(day) ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700',
                                            ].join(' '), children: day }, day));
                                    })] })] }))] }), error && _jsx("p", { className: "text-sm text-red-600", role: "alert", children: error }), helperText && !error && _jsx("p", { className: "text-sm text-gray-500", children: helperText })] }));
});
DatePicker.displayName = 'DatePicker';
export default DatePicker;
//# sourceMappingURL=date-picker.js.map