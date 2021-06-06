import moment from 'moment';
import randomcolor from 'randomcolor';
import React, { memo } from 'react';
import { getTodayTimerange } from './timeline.utils';
import { Logger } from '../../logger';
import { useStoreActions, useStoreState } from '../../store/easyPeasy';
import { TIMERANGE_MODE_TODAY } from '../../store/mainStore';
import { Box, Flex } from '@chakra-ui/layout';
import { Button } from '@chakra-ui/button';
import { Tooltip } from '@chakra-ui/tooltip';
import { AiOutlineCaretRight, AiOutlineLeft, AiOutlinePause, AiOutlineRight } from 'react-icons/ai';
import { DateRangeInput } from '../Datepicker';
import { OnDatesChangeProps } from '@datepicker-react/hooks';

const getDayBefore = d => moment(d).subtract(1, 'days');
const getDayAfter = d => moment(d).add(1, 'days');

export const Search = memo(() => {
    const timerange = useStoreState(state => state.timerange);

    const visibleTimerange = useStoreState(state => state.visibleTimerange);
    const timerangeMode = useStoreState(state => state.timerangeMode);
    const liveView = useStoreState(state => state.liveView);

    const setSelectedTimelineItem = useStoreActions(actions => actions.setSelectedTimelineItem);
    const loadTimerange = useStoreActions(actions => actions.loadTimerange);
    const setVisibleTimerange = useStoreActions(actions => actions.setVisibleTimerange);
    const setLiveView = useStoreActions(actions => actions.setLiveView);

    const createNewItem = () => {
        setSelectedTimelineItem({
            color: randomcolor(),
            beginDate: visibleTimerange[0].valueOf(),
            endDate: visibleTimerange[1].valueOf(),
        });
    };

    const showLiveViewButton = timerangeMode === TIMERANGE_MODE_TODAY;
    const toggleLiveView = () => {
        setLiveView(!liveView);
    };

    const handleOnDatesChange = (data: OnDatesChangeProps) => {
        Logger.debug('TIMERANGE:', data);

        const { startDate, endDate } = data;
        const newTimerange = [moment(startDate).startOf('day'), moment(endDate).endOf('day')];
        loadTimerange(newTimerange);
    };

    const selectToday = () => {
        loadTimerange(getTodayTimerange());
        setLiveView(true);
    };

    const selectYesterday = () => {
        const beginDate = getDayBefore(moment().startOf('day'));
        const endDate = getDayBefore(moment().endOf('day'));
        loadTimerange([beginDate, endDate]);
    };

    const goBackOneDay = () => {
        const beginDate = getDayBefore(moment(timerange[0]));
        const endDate = getDayBefore(moment(timerange[1]));
        loadTimerange([beginDate, endDate]);
    };

    const goForwardOneDay = () => {
        const beginDate = getDayAfter(moment(timerange[0]));
        const endDate = getDayAfter(moment(timerange[1]));
        loadTimerange([beginDate, endDate]);
    };

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

    Logger.debug('Have timerange in Search:', timerange);
    return (
        <Flex>
            <Box p={1}>
                <Button onClick={selectYesterday}>Yesterday</Button>
            </Box>
            <Box p={1}>
                <Button onClick={goBackOneDay}>
                    <AiOutlineLeft />
                </Button>
            </Box>
            <Box p={1}>
                <DateRangeInput
                    startDate={timerange[0].toDate()}
                    endDate={timerange[1].toDate()}
                    onDatesChange={handleOnDatesChange}
                />
            </Box>
            <Box p={1}>
                <Button onClick={goForwardOneDay}>
                    <AiOutlineRight />
                </Button>
            </Box>
            <Box p={1}>
                <Tooltip placement="bottom" label="Also activates Live view">
                    <Button
                        onClick={selectToday}
                        variant={showLiveViewButton ? 'solid' : 'outline'}
                    >
                        Today
                    </Button>
                </Tooltip>
            </Box>
            {showLiveViewButton && (
                <Box p={1}>
                    <Tooltip
                        placement="bottom"
                        title={liveView ? 'Pause live view' : 'Start live view'}
                    >
                        <Button onClick={toggleLiveView}>
                            {liveView ? <AiOutlinePause /> : <AiOutlineCaretRight />}
                        </Button>
                    </Tooltip>
                </Box>
            )}
            <Box flex={1} />
            <Box p={1}>
                <Tooltip
                    placement="bottom"
                    title="Start creating log with visible timerange as begin and end times."
                >
                    <Button onClick={createNewItem}>New Log</Button>
                </Tooltip>
            </Box>
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
