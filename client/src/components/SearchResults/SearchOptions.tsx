import moment from 'moment';
import { useState } from 'react';
import { Logger } from '../../logger';
import { Box, Flex } from '@chakra-ui/react';
import { Button } from '@chakra-ui/react';
import { AiOutlineLeft, AiOutlineRight } from 'react-icons/ai';
import { OnDatesChangeProps } from '@datepicker-react/hooks';
import { DateRangeInput } from '../Datepicker';
import { HStack, Text, useColorModeValue } from '@chakra-ui/react';

const getDayBefore = (d) => moment(d).subtract(1, 'days');
const getDayAfter = (d) => moment(d).add(1, 'days');

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
        const beginDate = moment().startOf('day');
        const endDate = moment().endOf('day');

        if (range === RANGE_OPTIONS.WEEK) {
            beginDate.subtract(7, 'days');
        }

        if (range === RANGE_OPTIONS.MONTH) {
            beginDate.subtract(1, 'month');
        }
        if (range === RANGE_OPTIONS.MONTHS_3) {
            beginDate.subtract(3, 'month');
        }
        if (range === RANGE_OPTIONS.YEAR) {
            beginDate.subtract(1, 'year');
        }
        if (range === RANGE_OPTIONS.YEARS_3) {
            beginDate.subtract(3, 'year');
        }
        setTimerange([beginDate, endDate]);

        setLocalRange(range);
    };

    const goBackOneDay = () => {
        const beginDate = getDayBefore(moment(timerange[0]));
        const endDate = getDayBefore(moment(timerange[1]));
        setTimerange([beginDate, endDate]);
    };

    const goForwardOneDay = () => {
        const beginDate = getDayAfter(moment(timerange[0]));
        const endDate = getDayAfter(moment(timerange[1]));
        setTimerange([beginDate, endDate]);
    };

    Logger.debug('Have timerange in Search:', timerange);

    const handleOnDatesChange = (data: OnDatesChangeProps) => {
        Logger.debug('TIMERANGE:', data);

        const { startDate, endDate } = data;
        const newTimerange = [moment(startDate).startOf('day'), moment(endDate).endOf('day')];

        setTimerange(newTimerange);
    };

    const selectVariant = (range) => (localRange === range ? 'solid' : 'outline');

    return (
        <Flex alignItems="center">
            <HStack>
                <Button onClick={goBackOneDay}>
                    <AiOutlineLeft />
                </Button>

                <DateRangeInput
                    startDate={timerange[0].toDate()}
                    endDate={timerange[1].toDate()}
                    onDatesChange={handleOnDatesChange}
                />

                <Button onClick={goForwardOneDay}>
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
