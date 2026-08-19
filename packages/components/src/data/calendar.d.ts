import React from 'react';
export interface CalendarProps {
    value?: Date;
    onChange?: (date: Date) => void;
    minDate?: Date;
    maxDate?: Date;
    disabledDates?: Date[];
    className?: string;
}
export declare const Calendar: React.FC<CalendarProps>;
export default Calendar;
//# sourceMappingURL=calendar.d.ts.map