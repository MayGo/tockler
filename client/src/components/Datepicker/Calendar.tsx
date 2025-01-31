import { Box, Button, Flex, HStack, Spacer, StylesProvider, useMultiStyleConfig } from '@chakra-ui/react';
import { useDatepicker } from '@datepicker-react/hooks';

import { ActionButton } from './components';
import { CalendarMonth } from './CalendarMonth';
import { YearSelect } from './YearSelect';
import { MonthSelect } from './MonthSelect';
import moment, { Moment } from 'moment';
import { CALENDAR_MODE } from '../../SummaryContext.util';
import { useEffect } from 'react';
import { monthLabelFormatFn, weekdayLabelFormatLong } from './utils/formatters';
import { DatepickerProvider } from './context/DatepickerContext';
import { CalendarYear } from './CalendarYear';

export interface ICalendarProps {
    dateCellRender: any;
    onDateClicked: any;
    setSelectedDate: any;
    selectedDate: Moment;
    selectedMode: CALENDAR_MODE;
    setSelectedMode: any;
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
    const inputDate = selectedDate.toDate();

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

    const year = selectedDate.year();
    const month = selectedDate.month();

    function goToPrevious() {
        const newDate = moment(selectedDate).subtract(1, selectedMode);
        setSelectedDate(newDate);
        dp.onDateSelect(newDate.toDate());
    }

    function goToNext() {
        const newDate = moment(selectedDate).add(1, selectedMode);
        setSelectedDate(newDate);
        dp.onDateSelect(newDate.toDate());
    }

    const onChangeYear = (event) => {
        const value = event.target.value;
        const newDate = moment(selectedDate).set('year', value);
        setSelectedDate(newDate);
        dp.onDateSelect(newDate.toDate());
    };

    const onChangeMonth = (event) => {
        const value = event.target.value;
        const newDate = moment(selectedDate).set('month', value);
        setSelectedDate(newDate);
        dp.onDateSelect(newDate.toDate());
    };

    const isMonthView = selectedMode === CALENDAR_MODE.MONTH;

    return (
        <DatepickerProvider
            weekdayLabelFormat={weekdayLabelFormatLong}
            monthLabelFormat={monthLabelFormatFn}
            {...dp}
            focusedDate={focusedDate}
        >
            <Box w="100%">
                <Flex justifyContent="space-between" p={4}>
                    <HStack spacing={3}>
                        <ActionButton
                            direction={'left'}
                            onClick={goToPrevious}
                            tooltipLabel={`Previous ${selectedMode}`}
                        />

                        {isMonthView && <MonthSelect value={month} onChange={onChangeMonth} />}
                        <YearSelect value={year} onChange={onChangeYear} />
                        <ActionButton direction={'right'} onClick={goToNext} tooltipLabel={`Next ${selectedMode}`} />
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
