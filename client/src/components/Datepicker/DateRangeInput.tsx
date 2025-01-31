import { CalendarIcon } from '@chakra-ui/icons';
import { Box, Stack, StackDivider, useBreakpointValue, Icon } from '@chakra-ui/react';
import { END_DATE, FocusedInput, getInputValue, OnDatesChangeProps, START_DATE } from '@datepicker-react/hooks';
import { Ref, useEffect, useRef, useState } from 'react';
import { AiOutlineSwapRight } from 'react-icons/ai';
import { Input, InputProps } from './components';
import { StylesProvider, StylesProviderProps, useStyleProps } from './context/StylesContext';
import { Datepicker, DatepickerElement, DatepickerProps } from './Datepicker';
import { dateRangeInputPhrases, DateRangeInputPhrases } from './phrases';
import { DateRangeInputStyles, InputDate } from './types';
import { defaultDisplayFormat } from './utils/formatters';

export interface DateRangeInputProps extends Partial<StylesProviderProps>, Partial<DatepickerProps> {
    startDateInputProps?: Partial<InputProps>;
    endDateInputProps?: Partial<InputProps>;
    phrases?: DateRangeInputPhrases;
    showDivider?: boolean;
    placement?: 'top' | 'bottom';
    onFocusChange?(focusedInput: FocusedInput): void;
    endIcon?: typeof CalendarIcon;
    endId?: string;
    endName?: string;
    endPlaceholder?: string;
    endRef?: Ref<HTMLInputElement>;
    endShowCalendarIcon?: boolean;
    startIcon?: typeof CalendarIcon;
    startId?: string;
    startName?: string;
    startPlaceholder?: string;
    startRef?: Ref<HTMLInputElement>;
    startShowCalendarIcon?: boolean;
    allowEditableInputs?: boolean;
}

export const DateRangeInput = (props: DateRangeInputProps) => {
    const {
        endDate: endDateProp = null,
        startDate: startDateProp = null,
        focusedInput: focusedInputProp = null,
        displayFormat = defaultDisplayFormat,
        endShowCalendarIcon = true,
        isDateBlocked = () => false,
        minBookingDays = 1,
        phrases = dateRangeInputPhrases,
        placement = 'bottom',
        showClose = true,
        showDivider = false,
        showResetDates = true,
        showSelectedDates = true,
        startShowCalendarIcon = true,
        onClose = () => {},
        onDatesChange = () => {},
        onFocusChange = () => {},
        styles: customStyles,
        overwriteDefaultStyles,
        startIcon,
        startId,
        startName,
        startPlaceholder,
        startRef,
        endId,
        endName,
        endRef,
        endIcon,
        endPlaceholder,
        changeActiveMonthOnSelect,
        dayLabelFormat,
        exactMinBookingDays,
        firstDayOfWeek,
        initialVisibleMonth,
        maxBookingDate,
        minBookingDate,
        monthLabelFormat,
        numberOfMonths,
        onDayRender,
        unavailableDates,
        weekdayLabelFormat,
        allowEditableInputs,
    } = props;

    const datepickerRef = useRef<DatepickerElement>(null);
    const datepickerWrapperRef = useRef<HTMLDivElement>(null);

    const [startDate, setStartDate] = useState<InputDate>(startDateProp);
    const [endDate, setEndDate] = useState<InputDate>(endDateProp);
    const [focusedInput, setFocusedInput] = useState<FocusedInput>(focusedInputProp);

    useEffect(() => {
        setStartDate(startDateProp);
        setEndDate(endDateProp);
    }, [startDateProp, endDateProp]);

    const styleProps = useStyleProps<DateRangeInputStyles>({
        dateRangeInputContainer: { spacing: 1 },
        dateRangeInputDivider: {},
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.addEventListener('click', onClickOutsideHandler);
        }
        return () => {
            window.removeEventListener('click', onClickOutsideHandler);
        };
    });

    function handleOnFocusChange(_focusedInput: FocusedInput) {
        setFocusedInput(_focusedInput);
        onFocusChange(_focusedInput);
    }

    function handleOnDatesChange(data: OnDatesChangeProps) {
        setStartDate(data.startDate);
        setEndDate(data.endDate);
        setFocusedInput(data.focusedInput);

        if (!data.focusedInput) {
            onDatesChange(data);
        }
    }

    function onClickOutsideHandler(event: Event) {
        if (
            focusedInput !== null &&
            datepickerWrapperRef &&
            datepickerWrapperRef.current &&
            // @ts-ignore
            !datepickerWrapperRef.current.contains(event.target)
        ) {
            handleOnFocusChange(null);
        }
    }

    function handleOnClose() {
        handleOnFocusChange(null);
        onClose();
    }

    function handleInputChange(date: Date) {
        if (datepickerRef && datepickerRef.current && datepickerRef.current.onDateSelect) {
            datepickerRef.current.onDateSelect(date);
        }
    }

    const isMobile = useBreakpointValue({ base: true, md: false });
    const vertical = props.vertical || isMobile;

    return (
        <StylesProvider styles={customStyles} overwriteDefaultStyles={overwriteDefaultStyles}>
            <Box position="relative" ref={datepickerWrapperRef}>
                <Stack
                    isInline={!isMobile}
                    {...styleProps.dateRangeInputContainer}
                    data-testid="DateRangeInputGrid"
                    divider={showDivider ? <StackDivider {...styleProps.dateRangeInputDivider} /> : undefined}
                    alignItems="center"
                >
                    <Input
                        iconComponent={startIcon}
                        id={startId || 'startDate'}
                        name={startName || 'startDate'}
                        placeholder={startPlaceholder || phrases.startDatePlaceholder}
                        ref={startRef}
                        showCalendarIcon={startShowCalendarIcon}
                        aria-label={phrases.startDateAriaLabel}
                        dateFormat={displayFormat}
                        isActive={focusedInput === START_DATE}
                        onChange={handleInputChange}
                        onClick={() => handleOnFocusChange(START_DATE)}
                        value={getInputValue(startDate, displayFormat, '')}
                        allowEditableInputs={allowEditableInputs}
                    />

                    <Icon as={AiOutlineSwapRight} w={6} h={6} />
                    <Input
                        id={endId || 'endDate'}
                        name={endName || 'endDate'}
                        ref={endRef}
                        iconComponent={endIcon}
                        placeholder={endPlaceholder || phrases.endDatePlaceholder}
                        showCalendarIcon={endShowCalendarIcon}
                        aria-label={phrases.endDateAriaLabel}
                        dateFormat={displayFormat}
                        disableAccessibility={focusedInput === START_DATE}
                        isActive={focusedInput === END_DATE}
                        onChange={handleInputChange}
                        onClick={() => handleOnFocusChange(!startDate ? START_DATE : END_DATE)}
                        value={getInputValue(endDate, displayFormat, '')}
                        allowEditableInputs={allowEditableInputs}
                    />
                </Stack>
                <Box
                    position="absolute"
                    top={placement === 'top' ? undefined : vertical ? '100px' : '45px'}
                    bottom={placement === 'bottom' ? undefined : vertical ? '100px' : '45px'}
                    minWidth="750px"
                >
                    {focusedInput !== null && (
                        <Datepicker
                            ref={datepickerRef}
                            startDate={startDate}
                            endDate={endDate}
                            focusedInput={focusedInput}
                            onClose={handleOnClose}
                            onDatesChange={handleOnDatesChange}
                            changeActiveMonthOnSelect={changeActiveMonthOnSelect}
                            dayLabelFormat={dayLabelFormat}
                            exactMinBookingDays={exactMinBookingDays}
                            firstDayOfWeek={firstDayOfWeek}
                            initialVisibleMonth={initialVisibleMonth}
                            isDateBlocked={isDateBlocked}
                            maxBookingDate={maxBookingDate}
                            minBookingDate={minBookingDate}
                            minBookingDays={minBookingDays}
                            monthLabelFormat={monthLabelFormat}
                            numberOfMonths={vertical ? 1 : numberOfMonths}
                            onDayRender={onDayRender}
                            phrases={phrases}
                            unavailableDates={unavailableDates}
                            displayFormat={displayFormat}
                            showClose={showClose}
                            showResetDates={showResetDates}
                            showSelectedDates={showSelectedDates}
                            vertical={vertical}
                            weekdayLabelFormat={weekdayLabelFormat}
                        />
                    )}
                </Box>
            </Box>
        </StylesProvider>
    );
};
