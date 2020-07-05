import { Box, Flex } from '@rebass/grid';
import { Button, DatePicker, Tooltip } from 'antd';
import { LeftOutlined, RightOutlined, PauseOutlined, CaretRightOutlined } from '@ant-design/icons';
import moment from 'moment';
import React from 'react';
import { getTodayTimerange } from './timeline.utils';
import { Logger } from '../../logger';
import { TIMERANGE_MODE_TODAY } from '../../TimelineContext';

const { RangePicker } = DatePicker;

interface IProps {
    timerange: any;
    loadTimerange: (timerange: any) => void;
    changeVisibleTimerange: (timerange: any) => void;
}

type IFullProps = IProps;

const getDayBefore = d => moment(d).subtract(1, 'days');
const getDayAfter = d => moment(d).add(1, 'days');

export const Search = ({
    timerangeMode,
    loadTimerange,
    timerange,
    visibleTimerange,
    changeVisibleTimerange,
    liveView,
    setLiveView,
}) => {
    const showLiveViewButton = timerangeMode === TIMERANGE_MODE_TODAY;
    const toggleLiveView = () => {
        setLiveView(!liveView);
    };
    const onChange = (dates: any) => {
        Logger.debug('TIMERANGE:', dates);
        if (dates != null) {
            const beginDate = dates[0];
            const endDate = dates[1];
            const newTimerange = [beginDate, endDate];
            loadTimerange(newTimerange);
        } else {
            Logger.error('No dates selected');
        }
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
        changeVisibleTimerange([beginDate, endDate]);
    };

    const showHour = () => {
        const beginDate = moment(visibleTimerange[1]).startOf('hour');
        const endDate = moment(visibleTimerange[1]).endOf('hour');
        changeVisibleTimerange([beginDate, endDate]);
    };

    const showAM = () => {
        const beginDate = moment(timerange[0]).startOf('day');
        const endDate = moment(timerange[0])
            .startOf('day')
            .hour(12);
        changeVisibleTimerange([beginDate, endDate]);
    };

    const showPM = () => {
        const beginDate = moment(timerange[0])
            .startOf('day')
            .hour(12);
        const endDate = moment(timerange[0]).endOf('day');
        changeVisibleTimerange([beginDate, endDate]);
    };

    const showEvening = () => {
        const beginDate = moment(visibleTimerange[0])
            .startOf('day')
            .hour(17);
        const endDate = moment(visibleTimerange[0]).endOf('day');
        changeVisibleTimerange([beginDate, endDate]);
    };

    Logger.debug('Have timerange in Search:', timerange);
    return (
        <Flex>
            <Box p={1}>
                <Button onClick={selectYesterday}>Yesterday</Button>
            </Box>
            <Box p={1}>
                <Button onClick={goBackOneDay}>
                    <LeftOutlined />
                </Button>
            </Box>
            <Box p={1}>
                <RangePicker value={timerange} onChange={onChange} />
            </Box>
            <Box p={1}>
                <Button onClick={goForwardOneDay}>
                    <RightOutlined />
                </Button>
            </Box>
            <Box p={1}>
                <Tooltip placement="bottom" title="Also activates Live view">
                    <Button onClick={selectToday} type={showLiveViewButton ? 'primary' : 'default'}>
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
                            {liveView ? <PauseOutlined /> : <CaretRightOutlined />}
                        </Button>
                    </Tooltip>
                </Box>
            )}
            <Box flex={1} />
            <Box p={1}>
                <Button onClick={showDay} type="dashed">
                    All Day
                </Button>
            </Box>
            <Box p={1}>
                <Button onClick={showAM} type="dashed">
                    AM
                </Button>
            </Box>
            <Box p={1}>
                <Button onClick={showPM} type="dashed">
                    PM
                </Button>
            </Box>
            <Box p={1}>
                <Button onClick={showEvening} type="dashed">
                    Evening
                </Button>
            </Box>
            <Box p={1}>
                <Button onClick={showHour} type="dashed">
                    Hour
                </Button>
            </Box>
        </Flex>
    );
};
