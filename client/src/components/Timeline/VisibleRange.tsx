import moment from 'moment';
import React, { memo } from 'react';
import { useStoreActions, useStoreState } from '../../store/easyPeasy';
import { Box, Flex } from '@chakra-ui/layout';
import { Button } from '@chakra-ui/button';

export const VisibleRange = memo(() => {
    const timerange = useStoreState(state => state.timerange);

    const visibleTimerange = useStoreState(state => state.visibleTimerange);

    const setVisibleTimerange = useStoreActions(actions => actions.setVisibleTimerange);
    const showDay = () => {
        const beginDate = moment(timerange[0]).startOf('day');
        const endDate = moment(timerange[0]).endOf('day');
        setVisibleTimerange([beginDate, endDate]);
    };

    const showHour = () => {
        const beginDate = moment(visibleTimerange[1]).startOf('hour');
        const endDate = moment(visibleTimerange[1]).endOf('hour');
        setVisibleTimerange([beginDate, endDate]);
    };

    const showAM = () => {
        const beginDate = moment(timerange[0]).startOf('day');
        const endDate = moment(timerange[0])
            .startOf('day')
            .hour(12);
        setVisibleTimerange([beginDate, endDate]);
    };

    const showPM = () => {
        const beginDate = moment(timerange[0])
            .startOf('day')
            .hour(12);
        const endDate = moment(timerange[0]).endOf('day');
        setVisibleTimerange([beginDate, endDate]);
    };

    const showEvening = () => {
        const beginDate = moment(visibleTimerange[0])
            .startOf('day')
            .hour(17);
        const endDate = moment(visibleTimerange[0]).endOf('day');
        setVisibleTimerange([beginDate, endDate]);
    };

    return (
        <Flex>
            <Box p={1}>
                <Button onClick={showDay} variant="outline">
                    All Day
                </Button>
            </Box>
            <Box p={1}>
                <Button onClick={showAM} variant="outline">
                    AM
                </Button>
            </Box>
            <Box p={1}>
                <Button onClick={showPM} variant="outline">
                    PM
                </Button>
            </Box>
            <Box p={1}>
                <Button onClick={showEvening} variant="outline">
                    Evening
                </Button>
            </Box>
            <Box p={1}>
                <Button onClick={showHour} variant="outline">
                    Hour
                </Button>
            </Box>
        </Flex>
    );
});
