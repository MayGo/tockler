import { Box, SimpleGrid, useStyles } from '@chakra-ui/react';
import { DateTime } from 'luxon';
import { MonthBox } from './components/MonthBox';
import { useDatepickerContext } from './context/DatepickerContext';

export interface YearProps {
    year: number;
    dateCellRender: (date: DateTime) => React.ReactNode;
    onDateClicked: (date: DateTime) => void;
}

export const CalendarYear = ({ dateCellRender, onDateClicked }: YearProps) => {
    const styles = useStyles();
    const { monthLabelFormat } = useDatepickerContext();

    const months = Array.from({ length: 12 }, (_, i) => {
        return DateTime.now().set({ month: i + 1 });
    });

    return (
        <Box w="100%">
            <Box __css={styles.separator} />
            <Box __css={styles.grid}>
                <SimpleGrid rowGap="1px" columnGap="1px" columns={7}>
                    {months.map((month: DateTime) => (
                        <MonthBox
                            date={month.toJSDate()}
                            key={month.month}
                            month={monthLabelFormat(month.toJSDate())}
                            onDateClicked={onDateClicked}
                        >
                            {dateCellRender(month)}
                        </MonthBox>
                    ))}
                    {/* 12 months leave the last row of 7 short; fill it like the month view's empty days. */}
                    {Array.from({ length: (7 - (months.length % 7)) % 7 }, (_, i) => (
                        <Box key={`trailing-${i}`} __css={styles.emptyDay} />
                    ))}
                </SimpleGrid>
            </Box>
        </Box>
    );
};
