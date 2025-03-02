import { Box, Flex, SimpleGrid, useStyles } from '@chakra-ui/react';
import { CalendarDay as DatepickerCalendarDay, useMonth } from '@datepicker-react/hooks';
import { DateTime } from 'luxon';

import { DayBox } from './components/DayBox';
import { useDatepickerContext } from './context/DatepickerContext';

export interface MonthProps {
    year: number;
    month: number;
    dateCellRender: (date: DateTime) => React.ReactNode;
    onDateClicked: (date: DateTime) => void;
}

export const CalendarMonth = ({ year, month, dateCellRender, onDateClicked }: MonthProps) => {
    const styles = useStyles();
    const { dayLabelFormat, monthLabelFormat, weekdayLabelFormat, firstDayOfWeek } = useDatepickerContext();

    const { days, weekdayLabels } = useMonth({
        year,
        month,
        dayLabelFormat,
        monthLabelFormat,
        weekdayLabelFormat,
        firstDayOfWeek,
    });

    return (
        <Box w="100%">
            <SimpleGrid columns={7}>
                {weekdayLabels.map((weekdayLabel: string) => (
                    <Flex key={weekdayLabel} __css={styles.weekdayLabel}>
                        {weekdayLabel}
                    </Flex>
                ))}
            </SimpleGrid>
            <Box __css={styles.grid}>
                <SimpleGrid rowGap="1px" columnGap="1px" columns={7}>
                    {days.map((day: DatepickerCalendarDay, index: number) =>
                        typeof day === 'object' ? (
                            <DayBox
                                date={day.date}
                                key={`${day.dayLabel}-${index}`}
                                day={day.dayLabel}
                                onDateClicked={onDateClicked}
                            >
                                {dateCellRender(DateTime.fromJSDate(day.date))}
                            </DayBox>
                        ) : (
                            <Box key={index} __css={styles.emptyDay} />
                        ),
                    )}
                </SimpleGrid>
            </Box>
        </Box>
    );
};
