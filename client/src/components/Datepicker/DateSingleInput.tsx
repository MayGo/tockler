import { Box } from '@chakra-ui/react';
import { getInputValue, OnDatesChangeProps, START_DATE } from '@datepicker-react/hooks';
import { forwardRef, Ref, useEffect, useRef, useState } from 'react';
import { Input, InputProps } from './components';
import { StylesProvider } from './context/StylesContext';
import { Datepicker, DatepickerElement, DatepickerProps } from './Datepicker';
import { DateSingleInputPhrases, dateSingleInputPhrases } from './phrases';
import { InputDate } from './types';
import { defaultDisplayFormat } from './utils/formatters';

export interface OnDateChangeProps {
    date: InputDate;
    showDatepicker: boolean;
}

export interface DateSingleInputProps extends Partial<InputProps>, Partial<DatepickerProps> {
    onFocusChange?(focusInput: boolean): void;
    phrases?: DateSingleInputPhrases;
    placement?: 'top' | 'bottom';
    showDatepicker?: boolean;
    date?: InputDate;
    showResetDate?: boolean;
}

export const DateSingleInput = forwardRef(
    (
        {
            date: dateProp = null,
            showDatepicker: showDatepickerProp = false,
            changeActiveMonthOnSelect,
            dayLabelFormat,
            displayFormat = defaultDisplayFormat,
            firstDayOfWeek,
            iconComponent,
            id = 'startDate',
            initialVisibleMonth,
            isDateBlocked = () => false,
            maxBookingDate,
            minBookingDate,
            monthLabelFormat,
            name = 'startDate',
            numberOfMonths = 1,
            onChange = () => {},
            onClick = () => {},
            onClose = () => {},
            onDayRender,
            onFocusChange = () => {},
            overwriteDefaultStyles,
            phrases = dateSingleInputPhrases,
            placeholder,
            placement = 'bottom',
            showCalendarIcon = true,
            showClose = true,
            showResetDate = true,
            styles,
            unavailableDates = [],
            value,
            vertical = false,
            weekdayLabelFormat,
            allowEditableInputs = false,
        }: DateSingleInputProps,
        ref: Ref<HTMLInputElement>,
    ) => {
        const datepickerRef = useRef<DatepickerElement>(null);
        const datepickerWrapperRef = useRef<HTMLDivElement>(null);

        const [date, setDate] = useState<InputDate>(value ? new Date(value) : dateProp);
        const [showDatepicker, setShowDatepicker] = useState(showDatepickerProp);

        useEffect(() => {
            onChange(date);
        }, [date, onChange]);

        useEffect(() => {
            onFocusChange(showDatepicker);
        }, [onFocusChange, showDatepicker]);

        useEffect(() => {
            if (typeof window !== 'undefined') {
                window.addEventListener('click', onClickOutsideHandler);
            }
            return () => {
                window.removeEventListener('click', onClickOutsideHandler);
            };
        });

        function handleOnFocusChange(show: boolean) {
            setShowDatepicker(show);
        }

        function onClickOutsideHandler(event: Event) {
            if (
                showDatepicker &&
                datepickerWrapperRef &&
                datepickerWrapperRef.current &&
                // @ts-ignore
                !datepickerWrapperRef.current.contains(event.target)
            ) {
                handleOnFocusChange(false);
            }
        }

        function handleDatepickerClose() {
            handleOnFocusChange(false);
            onClose();
        }

        function handleOnDatesChange(data: OnDatesChangeProps) {
            handleOnFocusChange(data.focusedInput !== null);
            setDate(data.startDate);
        }

        function handleInputChange(date: Date) {
            if (datepickerRef && datepickerRef.current && datepickerRef.current.onDateSelect) {
                datepickerRef.current.onDateSelect(date);
            }
        }

        return (
            <StylesProvider styles={styles} overwriteDefaultStyles={overwriteDefaultStyles}>
                <Box position="relative" ref={datepickerWrapperRef}>
                    <Input
                        ref={ref}
                        id={id}
                        name={name}
                        aria-label={phrases.dateAriaLabel}
                        value={getInputValue(date, displayFormat, '')}
                        placeholder={placeholder || phrases.datePlaceholder}
                        dateFormat={displayFormat}
                        showCalendarIcon={showCalendarIcon}
                        isActive={showDatepicker}
                        onChange={handleInputChange}
                        onClick={() => {
                            handleOnFocusChange(true);
                            onClick();
                        }}
                        disableAccessibility={false}
                        iconComponent={iconComponent}
                        allowEditableInputs={allowEditableInputs}
                    />

                    <Box
                        position="absolute"
                        top={placement === 'bottom' ? '45px' : undefined}
                        bottom={placement === 'top' ? '45px' : undefined}
                    >
                        {showDatepicker && (
                            <Datepicker
                                changeActiveMonthOnSelect={changeActiveMonthOnSelect}
                                dayLabelFormat={dayLabelFormat}
                                displayFormat={displayFormat}
                                endDate={date}
                                exactMinBookingDays
                                firstDayOfWeek={firstDayOfWeek}
                                focusedInput={showDatepicker ? START_DATE : null}
                                initialVisibleMonth={initialVisibleMonth}
                                isDateBlocked={isDateBlocked}
                                maxBookingDate={maxBookingDate}
                                minBookingDate={minBookingDate}
                                minBookingDays={1}
                                monthLabelFormat={monthLabelFormat}
                                numberOfMonths={numberOfMonths}
                                onClose={handleDatepickerClose}
                                onDatesChange={handleOnDatesChange}
                                onDayRender={onDayRender}
                                phrases={phrases}
                                ref={datepickerRef}
                                showClose={showClose}
                                showResetDates={showResetDate}
                                showSelectedDates={false}
                                startDate={date}
                                unavailableDates={unavailableDates}
                                vertical={vertical}
                                weekdayLabelFormat={weekdayLabelFormat}
                            />
                        )}
                    </Box>
                </Box>
            </StylesProvider>
        );
    },
);
