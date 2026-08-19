/**
 * WebBuilder Components - DatePicker Component
 * A date picker component with calendar popup.
 */
import React from 'react';
export type DatePickerVariant = 'default' | 'range';
export interface DatePickerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
    label?: string;
    value?: Date;
    onChange?: (date: Date | null) => void;
    minDate?: Date;
    maxDate?: Date;
    disabled?: boolean;
    placeholder?: string;
    error?: string;
    helperText?: string;
    size?: 'sm' | 'md' | 'lg';
    format?: string;
}
export declare const DatePicker: React.ForwardRefExoticComponent<DatePickerProps & React.RefAttributes<HTMLDivElement>>;
export default DatePicker;
//# sourceMappingURL=date-picker.d.ts.map