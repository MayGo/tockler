import {
    BoxProps,
    ButtonProps,
    CloseButtonProps,
    FlexProps,
    IconButtonProps,
    IconProps,
    InputAddonProps,
    InputGroupProps,
    InputProps,
    SimpleGridProps,
    StackDividerProps,
    StackProps,
} from '@chakra-ui/react';

export type StateProp<T extends any> = { base: T; active?: T };

export interface ActionButtonStyles {
    actionButton: Partial<IconButtonProps>;
}

export interface CloseButtonStyles {
    closeButton: Partial<CloseButtonProps>;
}

export interface DatepickerComponentStyles {
    datepickerContainer: BoxProps;
    monthsWrapper: StackProps;
    buttonsWrapper: StackProps;
    arrowIcon: Omit<IconProps, 'css'>;
    datepickerHeader: FlexProps;
}

export interface DayState<T extends any> {
    base: T;
    normal: T;
    rangeHover: T;
    selected: T;
    firstOrLast: T;
    first: T;
    last: T;
}

export interface DayStyles {
    day: DayState<ButtonProps>;
    dayContainer: DayState<BoxProps>;
}

export interface InputComponentStyles {
    inputComponentInputGroup: StateProp<InputGroupProps>;
    inputComponentInput: StateProp<InputProps>;
    inputComponentIcon: StateProp<Omit<IconProps, 'css'>>;
    inputComponentInputAddon: StateProp<InputAddonProps>;
}

export interface MonthStyles {
    monthContainer: BoxProps;
    monthMonthLabel: BoxProps;
    monthWeekdayLabel: BoxProps;
    emptyDay: BoxProps;
    monthDayGrid: SimpleGridProps;
}

export interface ResetDatesButtonStyles {
    resetDatesButton: ButtonProps;
}

export interface SelectDateStyles {
    selectDateContainer: StateProp<StackProps>;
    selectDateText: StateProp<BoxProps>;
    selectDateDateText: StateProp<BoxProps>;
}

export interface DateRangeInputStyles {
    dateRangeInputContainer: StackProps;
    dateRangeInputDivider: StackDividerProps;
}

export interface DatepickerStyles
    extends ActionButtonStyles,
        CloseButtonStyles,
        DatepickerComponentStyles,
        DayStyles,
        InputComponentStyles,
        MonthStyles,
        ResetDatesButtonStyles,
        SelectDateStyles,
        DateRangeInputStyles {}
