import { Button, Flex, HStack, Text, useColorModeValue } from '@chakra-ui/react';
import { memo, useMemo } from 'react';
import { useStoreActions, useStoreState } from '../../store/easyPeasy';

// Range types to identify different visible range options
export enum RangeType {
    ALL_DAY = 'ALL_DAY',
    AM = 'AM',
    PM = 'PM',
    EVENING = 'EVENING',
    HOUR = 'HOUR',
}

export const VisibleRange = memo(() => {
    const timerange = useStoreState((state) => state.timerange);
    const visibleTimerange = useStoreState((state) => state.visibleTimerange);
    const setVisibleTimerange = useStoreActions((actions) => actions.setVisibleTimerange);

    // Determine which range type is currently active based on the visible timerange
    const activeRange = useMemo(() => {
        if (!visibleTimerange || visibleTimerange.length !== 2) {
            return null;
        }

        const [start, end] = visibleTimerange;
        const dayStart = timerange[0].startOf('day');
        const dayEnd = timerange[0].endOf('day');
        const noon = dayStart.set({ hour: 12 });
        const evening = dayStart.set({ hour: 17 });

        // Check if it's the whole day
        if (start.hasSame(dayStart, 'minute') && end.hasSame(dayEnd, 'minute')) {
            return RangeType.ALL_DAY;
        }

        // Check if it's AM
        if (start.hasSame(dayStart, 'minute') && end.hasSame(noon, 'minute')) {
            return RangeType.AM;
        }

        // Check if it's PM
        if (start.hasSame(noon, 'minute') && end.hasSame(dayEnd, 'minute')) {
            return RangeType.PM;
        }

        // Check if it's Evening
        if (start.hasSame(evening, 'minute') && end.hasSame(dayEnd, 'minute')) {
            return RangeType.EVENING;
        }

        const diff = end.diff(start);

        // Check if it's an hourly view (one hour duration)
        if (Math.abs(diff.as('hours') - 1) < 0.05) {
            return RangeType.HOUR;
        }

        return null;
    }, [visibleTimerange, timerange]);

    const showDay = () => {
        const beginDate = timerange[0].startOf('day');
        const endDate = timerange[0].endOf('day');
        setVisibleTimerange([beginDate, endDate]);
    };

    const showHour = () => {
        const beginDate = visibleTimerange[0].startOf('hour');
        const endDate = beginDate.plus({ hours: 1 });
        setVisibleTimerange([beginDate, endDate]);
    };

    const showAM = () => {
        const beginDate = timerange[0].startOf('day');
        const endDate = timerange[0].startOf('day').set({ hour: 12 });
        setVisibleTimerange([beginDate, endDate]);
    };

    const showPM = () => {
        const beginDate = timerange[0].startOf('day').set({ hour: 12 });
        const endDate = timerange[0].endOf('day');
        setVisibleTimerange([beginDate, endDate]);
    };

    const showEvening = () => {
        const beginDate = visibleTimerange[0].startOf('day').set({ hour: 17 });
        const endDate = visibleTimerange[0].endOf('day');
        setVisibleTimerange([beginDate, endDate]);
    };

    return (
        <Flex alignItems="center">
            <Text fontSize="md" color={useColorModeValue('gray.700', 'gray.300')} pr={4}>
                Visible range
            </Text>
            <HStack>
                <Button
                    onClick={showDay}
                    variant={activeRange === RangeType.ALL_DAY ? 'solid' : 'outline'}
                    colorScheme={activeRange === RangeType.ALL_DAY ? 'green' : undefined}
                >
                    All Day
                </Button>

                <Button
                    onClick={showAM}
                    variant={activeRange === RangeType.AM ? 'solid' : 'outline'}
                    colorScheme={activeRange === RangeType.AM ? 'green' : undefined}
                >
                    AM
                </Button>

                <Button
                    onClick={showPM}
                    variant={activeRange === RangeType.PM ? 'solid' : 'outline'}
                    colorScheme={activeRange === RangeType.PM ? 'green' : undefined}
                >
                    PM
                </Button>

                <Button
                    onClick={showEvening}
                    variant={activeRange === RangeType.EVENING ? 'solid' : 'outline'}
                    colorScheme={activeRange === RangeType.EVENING ? 'green' : undefined}
                >
                    Evening
                </Button>
                <Button
                    onClick={showHour}
                    variant={activeRange === RangeType.HOUR ? 'solid' : 'outline'}
                    colorScheme={activeRange === RangeType.HOUR ? 'green' : undefined}
                >
                    Hour
                </Button>
            </HStack>
        </Flex>
    );
});
