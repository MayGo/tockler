import { Box, Flex } from '@rebass/grid';
import { Button, DatePicker, Icon } from 'antd';
import moment from 'moment';
import React from 'react';

import { Logger } from '../../logger';

const { RangePicker } = DatePicker;

interface IProps {
    timerange: any;
    setTimerange: (timerange: any) => void;
    changeVisibleTimerange: (timerange: any) => void;
}

type IFullProps = IProps;

const getDayBefore = d => moment(d).subtract(1, 'days');
const getDayAfter = d => moment(d).add(1, 'days');

export const SearchOptions = ({ setTimerange, timerange }) => {
    const onChange = (dates: any) => {
        Logger.debug('TIMERANGE:', dates);
        if (dates != null) {
            const beginDate = dates[0];
            const endDate = dates[1];
            const newTimerange = [beginDate, endDate];
            setTimerange(newTimerange);
        } else {
            Logger.error('No dates selected');
        }
    };

    const selectWeek = () => {
        const beginDate = moment()
            .startOf('day')
            .subtract(7, 'days');
        const endDate = moment().endOf('day');
        setTimerange([beginDate, endDate]);
    };
    const selectMonth = () => {
        const beginDate = moment()
            .startOf('day')
            .subtract(1, 'month');
        const endDate = moment().endOf('day');
        setTimerange([beginDate, endDate]);
    };

    const selectMonth3 = () => {
        const beginDate = moment()
            .startOf('day')
            .subtract(3, 'month');
        const endDate = moment().endOf('day');
        setTimerange([beginDate, endDate]);
    };

    const selectYear = () => {
        const beginDate = moment()
            .startOf('day')
            .subtract(1, 'year');
        const endDate = moment().endOf('day');
        setTimerange([beginDate, endDate]);
    };

    const selectYear3 = () => {
        const beginDate = moment()
            .startOf('day')
            .subtract(3, 'year');
        const endDate = moment().endOf('day');
        setTimerange([beginDate, endDate]);
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

    return (
        <Flex>
            <Box p={1}>
                <Button onClick={goBackOneDay}>
                    <Icon type="left" />
                </Button>
            </Box>
            <Box p={1}>
                <RangePicker value={timerange} onChange={onChange} />
            </Box>
            <Box p={1}>
                <Button onClick={goForwardOneDay}>
                    <Icon type="right" />
                </Button>
            </Box>

            <Box flex={1} />
            <Box p={1}>
                <Button onClick={selectWeek} type="dashed">
                    Week
                </Button>
            </Box>
            <Box p={1}>
                <Button onClick={selectMonth} type="dashed">
                    Month
                </Button>
            </Box>
            <Box p={1}>
                <Button onClick={selectMonth3} type="dashed">
                    3 Months
                </Button>
            </Box>
            <Box p={1}>
                <Button onClick={selectYear} type="dashed">
                    Year
                </Button>
            </Box>
            <Box p={1}>
                <Button onClick={selectYear3} type="dashed">
                    3 Years
                </Button>
            </Box>
        </Flex>
    );
};
