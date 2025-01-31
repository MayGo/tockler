import { Box, Flex, SimpleGrid, Text } from '@chakra-ui/react';
import { CalendarDay, useMonth } from '@datepicker-react/hooks';

import { useDatepickerContext } from '../context/DatepickerContext';
import { useStyleProps } from '../context/StylesContext';
import { MonthStyles } from '../types';
import { Day } from './Day';

export interface MonthProps {
    year: number;
    month: number;
}

export const Month = ({ year, month }: MonthProps) => {
    const styleProps = useStyleProps<MonthStyles>({
        monthContainer: {},
        monthMonthLabel: {
            justifyContent: 'center',
            fontWeight: 'bold',
            mb: 6,
            fontSize: ['md', 'lg'],
        },
        monthWeekdayLabel: {
            justifyContent: 'center',
            color: 'gray.500',
            mb: 4,
            fontSize: ['sm', 'md'],
        },
        monthDayGrid: {
            rowGap: 1,
        },
        emptyDay: {},
    });

    const { dayLabelFormat, monthLabelFormat, weekdayLabelFormat, firstDayOfWeek } = useDatepickerContext();

    const { days, weekdayLabels, monthLabel } = useMonth({
        year,
        month,
        dayLabelFormat,
        monthLabelFormat,
        weekdayLabelFormat,
        firstDayOfWeek,
    });

    return (
        <Box {...styleProps.monthContainer}>
            <Flex {...styleProps.monthMonthLabel}>
                <Text>{monthLabel}</Text>
            </Flex>
            <SimpleGrid columns={7}>
                {weekdayLabels.map((weekdayLabel: string) => (
                    <Flex key={weekdayLabel} {...styleProps.monthWeekdayLabel}>
                        <Text>{weekdayLabel}</Text>
                    </Flex>
                ))}
            </SimpleGrid>
            <SimpleGrid {...styleProps.monthDayGrid} columns={7}>
                {days.map((day: CalendarDay, index: number) =>
                    typeof day === 'object' ? (
                        <Day date={day.date} key={`${day.dayLabel}-${index}`} day={day.dayLabel} />
                    ) : (
                        <div key={index} />
                    ),
                )}
            </SimpleGrid>
        </Box>
    );
};
