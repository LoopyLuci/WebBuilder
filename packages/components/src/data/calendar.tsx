'use client';

import React from 'react';

export interface CalendarProps {
  value?: Date;
  onChange?: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  className?: string;
}

export const Calendar: React.FC<CalendarProps> = ({
  value,
  onChange,
  minDate,
  maxDate,
  disabledDates = [],
  className = '',
}) => {
  const [currentMonth, setCurrentMonth] = React.useState(() => {
    const d = value || new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const [selected, setSelected] = React.useState<Date | undefined>(value);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const isDisabled = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return disabledDates.some(d => d.toDateString() === date.toDateString());
  };

  const isSelected = (day: number) => {
    if (!selected) return false;
    return new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toDateString() === selected.toDateString();
  };

  const isToday = (day: number) => {
    const today = new Date();
    return new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toDateString() === today.toDateString();
  };

  const handleSelect = (day: number) => {
    if (isDisabled(day)) return;
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

  return (
    <div className={`w-full max-w-xs bg-background rounded-xl border border-border p-4 ${className}`} role="application" aria-label="Calendar">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-1 rounded hover:bg-muted" aria-label="Previous month">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="font-medium">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
        <button onClick={nextMonth} className="p-1 rounded hover:bg-muted" aria-label="Next month">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(d => (
          <div key={d} className="text-center text-xs text-muted-foreground py-1" aria-hidden="true">
            {d}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => (
          <div key={i} className="aspect-square">
            {day !== null ? (
              <button
                onClick={() => handleSelect(day)}
                disabled={isDisabled(day)}
                className={`w-full h-full rounded-lg text-sm flex items-center justify-center transition-colors ${
                  isSelected(day)
                    ? 'bg-blue-600 text-white'
                    : isToday(day)
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    : isDisabled(day)
                    ? 'text-muted-foreground opacity-50 cursor-not-allowed'
                    : 'hover:bg-muted'
                }`}
                aria-label={`${monthNames[currentMonth.getMonth()]} ${day}${isToday(day) ? ' (today)' : ''}`}
                aria-pressed={isSelected(day)}
              >
                {day}
              </button>
            ) : (
              <div />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendar;
