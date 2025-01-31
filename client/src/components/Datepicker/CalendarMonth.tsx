import { Box, Flex, SimpleGrid, useStyles } from '@chakra-ui/react';
import { CalendarDay as DatepickerCalendarDay, useMonth } from '@datepicker-react/hooks';

import { useDatepickerContext } from './context/DatepickerContext';
import { DayBox } from './components/DayBox';
import moment from 'moment';

export interface MonthProps {
    year: number;
    month: number;
    dateCellRender: any;
    onDateClicked: any;
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
                                {dateCellRender(moment(day.date))}
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
