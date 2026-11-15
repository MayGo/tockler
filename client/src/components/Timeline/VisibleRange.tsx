import { Box, Button, Flex, HStack, Input, Text, useColorModeValue } from '@chakra-ui/react';
import { memo, useEffect, useMemo, useState } from 'react';
import { TIME_FORMAT_SHORT } from '../../constants';
import { useStoreState } from '../../store/easyPeasy';
import { useSetVisibleRange } from './useSetVisibleRange';

// Range types to identify different visible range options
export enum RangeType {
    ALL_DAY = 'ALL_DAY',
    AM = 'AM',
    PM = 'PM',
    EVENING = 'EVENING',
    HOUR = 'HOUR',
    CUSTOM = 'CUSTOM',
}

export const VisibleRange = memo(() => {
    const timerange = useStoreState((state) => state.timerange);
    const visibleTimerange = useStoreState((state) => state.visibleTimerange);
    const setVisibleRange = useSetVisibleRange();

    // State for time inputs
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    // Flag to prevent infinite update loops
    const [updatingFromTimerange, setUpdatingFromTimerange] = useState(false);

    // Update time inputs when visibleTimerange changes
    useEffect(() => {
        if (visibleTimerange && visibleTimerange.length === 2) {
            setUpdatingFromTimerange(true);
            setStartTime(visibleTimerange[0].toFormat(TIME_FORMAT_SHORT));
            setEndTime(visibleTimerange[1].toFormat(TIME_FORMAT_SHORT));
            // Reset the flag after state updates
            setTimeout(() => setUpdatingFromTimerange(false), 0);
        }
    }, [visibleTimerange]);

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

        return RangeType.CUSTOM;
    }, [visibleTimerange, timerange]);

    const showDay = () => {
        const beginDate = timerange[0].startOf('day');
        const endDate = timerange[0].endOf('day');
        setVisibleRange([beginDate, endDate], { pinsPosition: false });
    };

    const showHour = () => {
        const beginDate = visibleTimerange[0].startOf('hour');
        const endDate = beginDate.plus({ hours: 1 });
        setVisibleRange([beginDate, endDate], { pinsPosition: false });
    };

    const showAM = () => {
        const beginDate = timerange[0].startOf('day');
        const endDate = timerange[0].startOf('day').set({ hour: 12 });
        setVisibleRange([beginDate, endDate], { pinsPosition: true });
    };

    const showPM = () => {
        const beginDate = timerange[0].startOf('day').set({ hour: 12 });
        const endDate = timerange[0].endOf('day');
        setVisibleRange([beginDate, endDate], { pinsPosition: true });
    };

    const showEvening = () => {
        const beginDate = timerange[0].startOf('day').set({ hour: 17 });
        const endDate = timerange[0].endOf('day');
        setVisibleRange([beginDate, endDate], { pinsPosition: true });
    };

    // Apply the custom time range
    const updateCustomTimeRange = (newStartTime, newEndTime) => {
        if (!newStartTime || !newEndTime) return;

        try {
            const [startHours, startMinutes] = newStartTime.split(':').map(Number);
            const [endHours, endMinutes] = newEndTime.split(':').map(Number);

            if (isNaN(startHours) || isNaN(startMinutes) || isNaN(endHours) || isNaN(endMinutes)) {
                return;
            }

            const beginDate = timerange[0].startOf('day').set({
                hour: startHours,
                minute: startMinutes || 0,
            });

            const endDate = timerange[0].startOf('day').set({
                hour: endHours,
                minute: endMinutes || 0,
            });

            // Only one day is loaded, so an end before the start can't be shown; the inputs flag it instead.
            if (endDate <= beginDate) {
                return;
            }

            setVisibleRange([beginDate, endDate], { pinsPosition: true });
        } catch (err) {
            console.error('Error parsing time inputs:', err);
        }
    };

    // Handler for time input changes - directly updates the timerange
    const handleTimeChange = (timeType) => (e) => {
        const timeStr = e.target.value;

        // Don't update if we're currently syncing from timerange changes
        if (updatingFromTimerange) return;

        if (timeType === 'start') {
            setStartTime(timeStr);
            updateCustomTimeRange(timeStr, endTime);
        } else {
            setEndTime(timeStr);
            updateCustomTimeRange(startTime, timeStr);
        }
    };

    // "HH:mm" strings compare correctly as text.
    const isInvertedRange = !!startTime && !!endTime && endTime <= startTime;

    return (
        <Flex direction="column" gap={3}>
            <Flex alignItems="center" justifyContent="end">
                <HStack spacing={3}>
                    <Box maxWidth="120px">
                        <Input
                            type="time"
                            aria-label="Visible range start"
                            value={startTime}
                            isInvalid={isInvertedRange}
                            onChange={handleTimeChange('start')}
                        />
                    </Box>
                    <Text fontSize="md">➜</Text>
                    <Box maxWidth="120px">
                        <Input
                            type="time"
                            aria-label="Visible range end"
                            value={endTime}
                            isInvalid={isInvertedRange}
                            onChange={handleTimeChange('end')}
                        />
                    </Box>
                </HStack>
            </Flex>
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
        </Flex>
    );
});
