import { Box, Flex, SimpleGrid, Text, useColorModeValue } from '@chakra-ui/react';
import { CalendarDay, useMonth } from '@datepicker-react/hooks';
import React from 'react';
import { useDatepickerContext } from './context/DatepickerContext';
import { useStyleProps } from './context/StylesContext';
import { MonthStyles } from './types';
import { DayForCalendar } from './components/DayForCalendar';
import moment from 'moment';

export interface MonthProps {
    year: number;
    month: number;
    dateCellRender: any;
    onDateClicked: any;
}

export const CalendarMonth = ({ year, month, dateCellRender, onDateClicked }: MonthProps) => {
    const styleProps = useStyleProps<MonthStyles>({
        monthContainer: {},
        monthMonthLabel: {
            justifyContent: 'center',
            fontWeight: 'bold',
            mb: 6,
            fontSize: ['md', 'lg'],
        },
        monthWeekdayLabel: {
            bg: 'gray.500',
            p: 3,
            pl: 4,
            fontWeight: 'bold',
            fontSize: ['sm', 'md'],
        },
        monthDayGrid: {
            rowGap: '1px',
            columnGap: '1px',
            bg: 'gray.500',
        },
        emptyDay: {
            bg: useColorModeValue('white', 'gray.700'),
            height: '156px',
            width: '100%',
            minWidth: 'unset',
            border: '2px solid',
            borderColor: 'transparent',
            background: useColorModeValue('white', 'gray.800'),
        },
    });

    const {
        dayLabelFormat,
        monthLabelFormat,
        weekdayLabelFormat,
        firstDayOfWeek,
    } = useDatepickerContext();

    const { days, weekdayLabels, monthLabel } = useMonth({
        year,
        month,
        dayLabelFormat,
        monthLabelFormat,
        weekdayLabelFormat,
        firstDayOfWeek,
    });

    return (
        <Box {...styleProps.monthContainer} w="100%">
            {/*<Flex {...styleProps.monthMonthLabel}>
                <Text>{monthLabel}</Text>
    </Flex>*/}
            <SimpleGrid columns={7}>
                {weekdayLabels.map((weekdayLabel: string) => (
                    <Flex key={weekdayLabel} {...styleProps.monthWeekdayLabel}>
                        {weekdayLabel}
                    </Flex>
                ))}
            </SimpleGrid>
            <SimpleGrid {...styleProps.monthDayGrid} columns={7}>
                {days.map((day: CalendarDay, index: number) =>
                    typeof day === 'object' ? (
                        <DayForCalendar
                            date={day.date}
                            key={`${day.dayLabel}-${index}`}
                            day={day.dayLabel}
                            onDateClicked={onDateClicked}
                        >
                            {dateCellRender(moment(day.date))}
                        </DayForCalendar>
                    ) : (
                        <Box key={index} {...styleProps.emptyDay} />
                    ),
                )}
            </SimpleGrid>
        </Box>
    );
};
