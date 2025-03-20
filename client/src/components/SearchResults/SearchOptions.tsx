import { Box, Button, Flex, HStack, Text, useColorModeValue } from '@chakra-ui/react';
import { OnDatesChangeProps } from '@datepicker-react/hooks';
import { DateTime } from 'luxon';
import { useState } from 'react';
import { AiOutlineLeft, AiOutlineRight } from 'react-icons/ai';
import { Logger } from '../../logger';
import { DateRangeInput } from '../Datepicker';

const getDayBefore = (d: DateTime) => d.minus({ days: 1 });
const getDayAfter = (d: DateTime) => d.plus({ days: 1 });

enum RANGE_OPTIONS {
    WEEK,
    MONTH,
    MONTHS_3,
    YEAR,
    YEARS_3,
}

export const SearchOptions = ({ setTimerange, timerange }) => {
    const [localRange, setLocalRange] = useState(RANGE_OPTIONS.WEEK);

    const selectRange = (range) => {
        let beginDate = DateTime.now().startOf('day');
        const endDate = DateTime.now().endOf('day');

        if (range === RANGE_OPTIONS.WEEK) {
            beginDate = beginDate.minus({ days: 7 });
        }

        if (range === RANGE_OPTIONS.MONTH) {
            beginDate = beginDate.minus({ months: 1 });
        }
        if (range === RANGE_OPTIONS.MONTHS_3) {
            beginDate = beginDate.minus({ months: 3 });
        }
        if (range === RANGE_OPTIONS.YEAR) {
            beginDate = beginDate.minus({ years: 1 });
        }
        if (range === RANGE_OPTIONS.YEARS_3) {
            beginDate = beginDate.minus({ years: 3 });
        }

        setTimerange([beginDate, endDate]);

        setLocalRange(range);
    };

    const goBackOneDay = () => {
        const beginDate = getDayBefore(timerange[0]);
        const endDate = getDayBefore(timerange[1]);
        setTimerange([beginDate, endDate]);
    };

    const goForwardOneDay = () => {
        const beginDate = getDayAfter(timerange[0]);
        const endDate = getDayAfter(timerange[1]);
        setTimerange([beginDate, endDate]);
    };

    const handleOnDatesChange = (data: OnDatesChangeProps) => {
        Logger.debug('TIMERANGE:', data);

        const { startDate, endDate } = data;
        if (!startDate || !endDate) {
            return;
        }
        const newTimerange = [DateTime.fromJSDate(startDate).startOf('day'), DateTime.fromJSDate(endDate).endOf('day')];

        setTimerange(newTimerange);
    };

    const selectVariant = (range) => (localRange === range ? 'solid' : 'outline');

    return (
        <Flex alignItems="center">
            <HStack>
                <Button onClick={goBackOneDay} variant="outline">
                    <AiOutlineLeft />
                </Button>

                <DateRangeInput
                    startDate={timerange[0].toJSDate()}
                    endDate={timerange[1].toJSDate()}
                    onDatesChange={handleOnDatesChange}
                />

                <Button onClick={goForwardOneDay} variant="outline">
                    <AiOutlineRight />
                </Button>
            </HStack>

            <Box flex={1} />

            <Text fontSize="md" color={useColorModeValue('gray.700', 'gray.300')} pr={4}>
                Select range
            </Text>
            <HStack>
                <Button onClick={() => selectRange(RANGE_OPTIONS.WEEK)} variant={selectVariant(RANGE_OPTIONS.WEEK)}>
                    Week
                </Button>

                <Button onClick={() => selectRange(RANGE_OPTIONS.MONTH)} variant={selectVariant(RANGE_OPTIONS.MONTH)}>
                    Month
                </Button>

                <Button
                    onClick={() => selectRange(RANGE_OPTIONS.MONTHS_3)}
                    variant={selectVariant(RANGE_OPTIONS.MONTHS_3)}
                >
                    3 Months
                </Button>

                <Button onClick={() => selectRange(RANGE_OPTIONS.YEAR)} variant={selectVariant(RANGE_OPTIONS.YEAR)}>
                    Year
                </Button>

                <Button
                    onClick={() => selectRange(RANGE_OPTIONS.YEARS_3)}
                    variant={selectVariant(RANGE_OPTIONS.YEARS_3)}
                >
                    3 Years
                </Button>
            </HStack>
        </Flex>
    );
};
