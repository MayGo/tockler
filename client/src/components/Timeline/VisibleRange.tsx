import { Button, Flex, HStack, Text, useColorModeValue } from '@chakra-ui/react';
import { memo } from 'react';
import { useStoreActions, useStoreState } from '../../store/easyPeasy';

export const VisibleRange = memo(() => {
    const timerange = useStoreState((state) => state.timerange);

    const visibleTimerange = useStoreState((state) => state.visibleTimerange);

    const setVisibleTimerange = useStoreActions((actions) => actions.setVisibleTimerange);
    const showDay = () => {
        const beginDate = timerange[0].startOf('day');
        const endDate = timerange[0].endOf('day');
        setVisibleTimerange([beginDate, endDate]);
    };

    const showHour = () => {
        const beginDate = visibleTimerange[1].startOf('hour');
        const endDate = visibleTimerange[1].endOf('hour');
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
                <Button onClick={showDay} variant="outline">
                    All Day
                </Button>

                <Button onClick={showAM} variant="outline">
                    AM
                </Button>

                <Button onClick={showPM} variant="outline">
                    PM
                </Button>

                <Button onClick={showEvening} variant="outline">
                    Evening
                </Button>
                <Button onClick={showHour} variant="outline">
                    Hour
                </Button>
            </HStack>
        </Flex>
    );
});
