import { Box, SimpleGrid, useStyles } from '@chakra-ui/react';

import { useDatepickerContext } from './context/DatepickerContext';
import moment, { Moment } from 'moment';
import { MonthBox } from './components/MonthBox';

export interface YearProps {
    year: number;
    dateCellRender: any;
    onDateClicked: any;
}

export const CalendarYear = ({ dateCellRender, onDateClicked }: YearProps) => {
    const styles = useStyles();
    const { monthLabelFormat } = useDatepickerContext();

    const months = Array.apply(0, Array(12)).map(function (_, i) {
        return moment().month(i);
    });

    return (
        <Box w="100%">
            <Box __css={styles.separator} />
            <Box __css={styles.grid}>
                <SimpleGrid rowGap="1px" columnGap="1px" columns={7}>
                    {months.map((month: Moment) => (
                        <MonthBox
                            date={month.toDate()}
                            key={month.month()}
                            month={monthLabelFormat(month.toDate())}
                            onDateClicked={onDateClicked}
                        >
                            {dateCellRender(month)}
                        </MonthBox>
                    ))}
                </SimpleGrid>
            </Box>
        </Box>
    );
};
