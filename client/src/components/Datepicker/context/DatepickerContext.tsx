import { FocusedInput, FormatFunction, useDatepicker } from '@datepicker-react/hooks';
import { createContext, ReactNode, useContext } from 'react';
import { datepickerPhrases, DatepickerPhrases } from '../phrases';
import { InputDate } from '../types';
import { dayLabelFormatFn, defaultDisplayFormat, monthLabelFormatFn, weekdayLabelFormatFn } from '../utils/formatters';

export type UseDatepickerReturnType = ReturnType<typeof useDatepicker>;

export interface DatepickerFormatProps {
    dayLabelFormat: typeof dayLabelFormatFn;
    weekdayLabelFormat: typeof weekdayLabelFormatFn;
    monthLabelFormat: typeof monthLabelFormatFn;
}

export type OnDayRenderType = {
    isFirst: boolean;
    isLast: boolean;
    isSelected: boolean;
    isWithinHoverRange: boolean;
    isSelectedStartOrEnd: boolean;
    disabledDate: boolean;
};

export interface DatepickerContextBaseProps {
    displayFormat: FormatFunction | string;
    startDate: InputDate;
    endDate: InputDate;
    phrases: DatepickerPhrases;
    focusedInput: FocusedInput;
    onDayRender?(date: Date, state: OnDayRenderType): ReactNode;
    children?: ReactNode;
}

export interface DatepickerContextProps
    extends DatepickerContextBaseProps,
        DatepickerFormatProps,
        UseDatepickerReturnType {}

export interface DatepickerProviderProps extends Partial<DatepickerContextProps> {}

const defaultBase: DatepickerContextBaseProps = {
    startDate: null,
    endDate: null,
    focusedInput: null,
    onDayRender: undefined,
    displayFormat: defaultDisplayFormat,
    phrases: datepickerPhrases,
};

const defaultFormatters: DatepickerFormatProps = {
    monthLabelFormat: monthLabelFormatFn,
    weekdayLabelFormat: weekdayLabelFormatFn,
    dayLabelFormat: dayLabelFormatFn,
};

const defaultUseDatepicker: UseDatepickerReturnType = {
    numberOfMonths: 2,
    activeMonths: [],
    firstDayOfWeek: 0,
    focusedDate: null,
    hoveredDate: null,
    goToDate: () => {},
    goToNextMonths: () => {},
    goToNextMonthsByOneMonth: () => {},
    goToNextYear: () => {},
    goToPreviousMonths: () => {},
    goToPreviousMonthsByOneMonth: () => {},
    goToPreviousYear: () => {},
    isDateBlocked: () => false,
    isDateFocused: () => false,
    isDateHovered: () => false,
    isDateSelected: () => false,
    isEndDate: () => false,
    isFirstOrLastSelectedDate: () => false,
    isStartDate: () => false,
    onDateFocus: () => {},
    onDateHover: () => {},
    onDateSelect: () => {},
    onResetDates: () => {},
};

export const datepickerContextDefaultValue: DatepickerContextProps = {
    ...defaultBase,
    ...defaultFormatters,
    ...defaultUseDatepicker,
};

export const DatepickerContext = createContext(datepickerContextDefaultValue);

export const useDatepickerContext = () => useContext(DatepickerContext);

export const DatepickerProvider = ({ children, ...props }: DatepickerProviderProps) => (
    <DatepickerContext.Provider value={{ ...datepickerContextDefaultValue, ...props }}>
        {children}
    </DatepickerContext.Provider>
);
