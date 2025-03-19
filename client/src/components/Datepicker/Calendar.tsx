import { Box, Button, Flex, HStack, Spacer, StylesProvider, useMultiStyleConfig } from '@chakra-ui/react';
import { useDatepicker } from '@datepicker-react/hooks';
import { DateTime } from 'luxon';

import { useEffect } from 'react';
import { AiOutlineLeft, AiOutlineRight } from 'react-icons/ai';
import { CALENDAR_MODE } from '../../SummaryContext.util';
import { CalendarMonth } from './CalendarMonth';
import { CalendarYear } from './CalendarYear';
import { DatepickerProvider } from './context/DatepickerContext';
import { MonthSelect } from './MonthSelect';
import { monthLabelFormatFn, weekdayLabelFormatLong } from './utils/formatters';
import { YearSelect } from './YearSelect';

export interface ICalendarProps {
    dateCellRender: (date: DateTime) => React.ReactNode;
    onDateClicked: (date: DateTime) => void;
    setSelectedDate: (date: DateTime) => void;
    selectedDate: DateTime;
    selectedMode: CALENDAR_MODE;
    setSelectedMode: (mode: CALENDAR_MODE) => void;
    focusedDate: Date;
}

export const Calendar = ({
    selectedDate,
    dateCellRender,
    onDateClicked,
    setSelectedDate,
    selectedMode,
    setSelectedMode,
    focusedDate,
}: ICalendarProps) => {
    const inputDate = selectedDate.toJSDate();

    const dp = useDatepicker({
        onDatesChange: () => null,
        startDate: inputDate,
        endDate: inputDate,
        focusedInput: null,
        numberOfMonths: 1,
    });

    useEffect(() => {
        dp.onDateFocus(focusedDate);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [focusedDate]);

    const styles = useMultiStyleConfig('Calendar', {});

    const year = selectedDate.year;
    const month = selectedDate.month - 1; // Luxon months are 1-12, but we need 0-11 for the selects

    function goToPrevious() {
        const newDate = selectedDate.minus({ [selectedMode]: 1 });
        setSelectedDate(newDate);
        dp.onDateSelect(newDate.toJSDate());
    }

    function goToNext() {
        const newDate = selectedDate.plus({ [selectedMode]: 1 });
        setSelectedDate(newDate);
        dp.onDateSelect(newDate.toJSDate());
    }

    const onChangeYear = (event) => {
        const value = event.target.value;
        const newDate = selectedDate.set({ year: value });
        setSelectedDate(newDate);
        dp.onDateSelect(newDate.toJSDate());
    };

    const onChangeMonth = (event) => {
        const value = Number(event.target.value) + 1; // Convert back to 1-12 for Luxon
        const newDate = selectedDate.set({ month: value });
        setSelectedDate(newDate);
        dp.onDateSelect(newDate.toJSDate());
    };

    const isMonthView = selectedMode === CALENDAR_MODE.MONTH;

    return (
        <DatepickerProvider
            weekdayLabelFormat={weekdayLabelFormatLong}
            monthLabelFormat={monthLabelFormatFn}
            {...dp}
            focusedDate={focusedDate}
        >
            <Box w="full">
                <Flex justifyContent="space-between" p={4}>
                    <HStack spacing={3}>
                        <Box>
                            <Button onClick={goToPrevious} variant="outline">
                                <AiOutlineLeft />
                            </Button>
                        </Box>
                        {isMonthView && <MonthSelect value={month} onChange={onChangeMonth} />}
                        <YearSelect value={year} onChange={onChangeYear} />
                        <Box>
                            <Button onClick={goToNext} variant="outline">
                                <AiOutlineRight />
                            </Button>
                        </Box>
                    </HStack>
                    <Spacer />
                    <HStack spacing={3}>
                        <Button
                            variant={isMonthView ? 'outline' : 'ghost'}
                            onClick={() => setSelectedMode(CALENDAR_MODE.MONTH)}
                        >
                            Month view
                        </Button>
                        <Button
                            variant={!isMonthView ? 'outline' : 'ghost'}
                            onClick={() => setSelectedMode(CALENDAR_MODE.YEAR)}
                        >
                            Year view
                        </Button>
                    </HStack>
                </Flex>
                <StylesProvider value={styles}>
                    {isMonthView && (
                        <CalendarMonth
                            year={year}
                            month={month}
                            dateCellRender={dateCellRender}
                            onDateClicked={onDateClicked}
                        />
                    )}
                    {!isMonthView && (
                        <CalendarYear year={year} dateCellRender={dateCellRender} onDateClicked={onDateClicked} />
                    )}
                </StylesProvider>
            </Box>
        </DatepickerProvider>
    );
};
