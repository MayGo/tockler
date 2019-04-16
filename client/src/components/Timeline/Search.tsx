import * as React from 'react';
import { DatePicker, Button } from 'antd';
import moment from 'moment';
const { RangePicker } = DatePicker;
import { Flex, Box } from 'grid-styled';

interface IProps {
    timerange: any;
    loadTimerange: (timerange: any) => void;
    changeVisibleTimerange: (timerange: any) => void;
}

interface IHocProps {}

type IFullProps = IProps & IHocProps;

const getDayBefore = d => moment(d).subtract(1, 'days');
const getDayAfter = d => moment(d).add(1, 'days');

export class Search extends React.PureComponent<IFullProps, IProps> {
    constructor(props: any) {
        super(props);
        this.onChange = this.onChange.bind(this);
    }

    onChange = (dates: any) => {
        console.log('TIMERANGE:', dates, this.props);
        if (dates != null) {
            const beginDate = dates[0];
            const endDate = dates[1];
            const newTimerange = [beginDate, endDate];
            this.props.loadTimerange(newTimerange);
        } else {
            console.error('No dates selected');
        }
    };

    selectToday = () => {
        const beginDate = moment().startOf('day');
        const endDate = moment().endOf('day');
        this.props.loadTimerange([beginDate, endDate]);
    };

    selectYesterday = () => {
        const beginDate = getDayBefore(moment().startOf('day'));
        const endDate = getDayBefore(moment().endOf('day'));
        this.props.loadTimerange([beginDate, endDate]);
    };

    goBackOneDay = () => {
        const { timerange } = this.props;
        const beginDate = getDayBefore(moment(timerange[0]));
        const endDate = getDayBefore(moment(timerange[1]));
        this.props.loadTimerange([beginDate, endDate]);
    };

    goForwardOneDay = () => {
        const { timerange } = this.props;
        const beginDate = getDayAfter(moment(timerange[0]));
        const endDate = getDayAfter(moment(timerange[1]));
        this.props.loadTimerange([beginDate, endDate]);
    };

    showDay = () => {
        const beginDate = moment().startOf('day');
        const endDate = moment().endOf('day');
        this.props.changeVisibleTimerange([beginDate, endDate]);
    };

    showHour = () => {
        const beginDate = moment().startOf('hour');
        const endDate = moment().endOf('hour');
        this.props.changeVisibleTimerange([beginDate, endDate]);
    };

    showAM = () => {
        const beginDate = moment().startOf('day');
        const endDate = moment()
            .startOf('day')
            .hour(12);
        this.props.changeVisibleTimerange([beginDate, endDate]);
    };

    showPM = () => {
        const beginDate = moment()
            .startOf('day')
            .hour(12);
        const endDate = moment().endOf('day');
        this.props.changeVisibleTimerange([beginDate, endDate]);
    };
    showEvening = () => {
        const beginDate = moment()
            .startOf('day')
            .hour(17);
        const endDate = moment().endOf('day');
        this.props.changeVisibleTimerange([beginDate, endDate]);
    };

    render() {
        const { timerange } = this.props;

        console.log('Have timerange in Search:', timerange);
        return (
            <Flex py={1}>
                <Box px={1}>
                    <Button onClick={this.selectYesterday}>Yesterday</Button>
                </Box>
                <Box px={1}>
                    <Button onClick={this.goBackOneDay}>{'<'}</Button>
                </Box>
                <Box px={1}>
                    <RangePicker value={timerange} onChange={this.onChange} />
                </Box>
                <Box px={1}>
                    <Button onClick={this.goForwardOneDay}>{'>'}</Button>
                </Box>
                <Box px={1}>
                    <Button onClick={this.selectToday}>Today</Button>
                </Box>
                <Box width={1} />
                <Box px={1}>
                    <Button onClick={this.showDay} type="dashed">
                        All Day
                    </Button>
                </Box>
                <Box px={1}>
                    <Button onClick={this.showAM} type="dashed">
                        AM
                    </Button>
                </Box>
                <Box px={1}>
                    <Button onClick={this.showPM} type="dashed">
                        PM
                    </Button>
                </Box>
                <Box px={1}>
                    <Button onClick={this.showEvening} type="dashed">
                        Evening
                    </Button>
                </Box>
                <Box px={1}>
                    <Button onClick={this.showHour} type="dashed">
                        Hour
                    </Button>
                </Box>
            </Flex>
        );
    }
}
