import { Box, Button, Flex, HStack, Spacer, useColorModeValue } from '@chakra-ui/react';
import { useDatepicker } from '@datepicker-react/hooks';
import React from 'react';
import { ActionButton } from './components';
import { useStyleProps } from './context/StylesContext';
import { DatepickerComponentStyles } from './types';
import { CalendarMonth } from './CalendarMonth';
import { YearSelect } from './YearSelect';
import { MonthSelect } from './MonthSelect';
import moment, { Moment } from 'moment';
import { CALENDAR_MODE } from '../../SummaryContext.util';

export interface ICalendarProps {
    dateCellRender: any;
    onDateClicked: any;
    setSelectedDate: any;
    selectedDate: Moment;
    selectedMode: CALENDAR_MODE;
    setSelectedMode: any;
}

export const Calendar = ({
    selectedDate,
    dateCellRender,
    onDateClicked,
    setSelectedDate,
    selectedMode,
    setSelectedMode,
}: ICalendarProps) => {
    const inputDate = selectedDate.toDate();

    const dp = useDatepicker({
        onDatesChange: () => null,
        startDate: inputDate,
        endDate: inputDate,
        focusedInput: null,
        numberOfMonths: 1,
    });

    const styleProps = useStyleProps<DatepickerComponentStyles>({
        datepickerContainer: {
            background: useColorModeValue('white', 'gray.700'),
            borderRadius: 'md',
            position: 'relative',
            width: 'fit-content',
            shadow: 'md',
            px: [3, 5],
            py: [5, 7],
            zIndex: 1,
        },
        monthsWrapper: {
            spacing: [0, 8],
        },
        buttonsWrapper: {
            spacing: [1, 3],
        },
        arrowIcon: {
            my: [5, 15],
            color: 'gray.500',
        },
        datepickerHeader: {
            justifyContent: 'space-between',
            p: [1, 4],
        },
    });

    const year = selectedDate.year();
    const month = selectedDate.month();

    console.info('year, month, selectedDate', year, month, selectedDate.toISOString());

    function goToPreviousMonths() {
        const newDate = moment(selectedDate).subtract(1, 'month');
        setSelectedDate(newDate);
        dp.onDateSelect(newDate.toDate());
    }

    function goToNextMonths() {
        const newDate = moment(selectedDate).add(1, 'month');
        setSelectedDate(newDate);
        dp.onDateSelect(newDate.toDate());
    }

    const onChangeYear = event => {
        const value = event.target.value;

        const newDate = moment(selectedDate).set('year', value);
        setSelectedDate(newDate);
        dp.onDateSelect(newDate.toDate());
    };
    const onChangeMonth = event => {
        const value = event.target.value;

        const newDate = moment(selectedDate).set('month', value);
        setSelectedDate(newDate);
        dp.onDateSelect(newDate.toDate());
    };

    return (
        <Box {...styleProps.monthContainer} w="100%">
            <Flex {...styleProps.datepickerHeader}>
                <HStack {...styleProps.buttonsWrapper}>
                    <ActionButton
                        direction={'left'}
                        onClick={goToPreviousMonths}
                        aria-label="Previous month"
                    />
                    <MonthSelect value={month} onChange={onChangeMonth} />
                    <YearSelect value={year} onChange={onChangeYear} />
                    <ActionButton
                        direction={'right'}
                        onClick={goToNextMonths}
                        aria-label="Next month"
                    />
                </HStack>
                <Spacer />
                <HStack {...styleProps.buttonsWrapper}>
                    <Button
                        variant={selectedMode === CALENDAR_MODE.YEAR ? 'outline' : 'ghost'}
                        onClick={() => setSelectedMode(CALENDAR_MODE.YEAR)}
                    >
                        Year view
                    </Button>
                    <Button
                        variant={selectedMode === CALENDAR_MODE.MONTH ? 'outline' : 'ghost'}
                        onClick={() => setSelectedMode(CALENDAR_MODE.MONTH)}
                    >
                        Month view
                    </Button>
                </HStack>
            </Flex>
            {selectedMode === CALENDAR_MODE.MONTH && (
                <CalendarMonth
                    year={year}
                    month={month}
                    dateCellRender={dateCellRender}
                    onDateClicked={onDateClicked}
                />
            )}
            {selectedMode === CALENDAR_MODE.YEAR && (
                <CalendarMonth
                    year={year}
                    month={month}
                    dateCellRender={dateCellRender}
                    onDateClicked={onDateClicked}
                />
            )}
        </Box>
    );
};
