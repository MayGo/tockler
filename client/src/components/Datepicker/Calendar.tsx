import { Box, Button, Flex, HStack, Spacer, useColorModeValue } from '@chakra-ui/react';
import { useDatepicker } from '@datepicker-react/hooks';
import React, { useEffect } from 'react';
import { ActionButton } from './components';
import { useStyleProps } from './context/StylesContext';
import { DatepickerComponentStyles } from './types';
import { CalendarMonth } from './CalendarMonth';
import { YearSelect } from './YearSelect';
import { MonthSelect } from './MonthSelect';
import moment, { Moment } from 'moment';

export interface MonthProps {
    dateCellRender: any;
    onDateClicked: any;
    onDatesChange: any;
    selectedDate: Moment;
}

export const Calendar = ({
    selectedDate,
    dateCellRender,
    onDateClicked,
    onDatesChange,
}: MonthProps) => {
    const date = selectedDate.toDate();

    const dp = useDatepicker({
        onDatesChange: () => {},
        startDate: date,
        endDate: date,
        focusedInput: null,
        numberOfMonths: 1,
    });

    function goToNextMonths() {
        dp.goToNextMonths();
    }

    function goToPreviousMonths() {
        dp.goToPreviousMonths();
    }

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

    const activeMonth = dp.activeMonths[0];
    const year = activeMonth.year;
    const month = activeMonth.month;

    useEffect(() => {
        console.info('yearmonth changed');
        onDatesChange(
            moment(selectedDate)
                .set('month', month)
                .set('year', year),
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [year, month]);

    console.info('year', year, month, selectedDate.toISOString());

    const onChangeYear = event => {
        const value = event.target.value;
        onDatesChange(moment(selectedDate).set('year', value));
    };
    const onChangeMonth = event => {
        const value = event.target.value;
        console.info('new monthn', value);
        onDatesChange(moment(selectedDate).set('month', value));
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
                    <Button variant="outline" onClick={goToNextMonths}>
                        Year view
                    </Button>
                    <Button variant="ghost" onClick={goToNextMonths}>
                        Month view
                    </Button>
                </HStack>
            </Flex>

            <CalendarMonth
                year={year}
                month={month}
                dateCellRender={dateCellRender}
                onDateClicked={onDateClicked}
            />
        </Box>
    );
};
