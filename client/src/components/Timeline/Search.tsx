import * as React from 'react';

import { TimeRange } from 'pondjs';
import { DatePicker, Button } from 'antd';
import * as moment from 'moment';
const { RangePicker } = DatePicker;
import { Flex, Box } from 'grid-styled';

interface IProps {
    timerange: any;
    loadTimerange: (timerange: any) => void;
}

interface IHocProps {}

type IFullProps = IProps & IHocProps;

export class Search extends React.Component<IFullProps, IProps> {
    constructor(props: any) {
        super(props);
        this.onChange = this.onChange.bind(this);
    }

    onChange = (dates: any, dateStrings: [string, string]) => {
        console.log('TIMERANGE:', dates, this.props);
        if (dates != null) {
            const beginDate = dates[0].toDate();
            const endDate = dates[1].toDate();
            const newTimerange = new TimeRange(beginDate, endDate);
            this.props.loadTimerange(newTimerange);
        } else {
            console.error('No dates selected');
        }
    };
    selectToday = () => {
        console.log('Select today');
        const beginDate = moment()
            .startOf('day')
            .toDate();
        const endDate = moment()
            .endOf('day')
            .toDate();
        const newTimerange = new TimeRange(beginDate, endDate);
        this.props.loadTimerange(newTimerange);
    };
    selectYesterday = () => {
        console.log('Select today');
        const beginDate = moment()
            .startOf('day')
            .subtract(1, 'days')
            .toDate();
        const endDate = moment()
            .endOf('day')
            .subtract(1, 'days')
            .toDate();
        const newTimerange = new TimeRange(beginDate, endDate);
        this.props.loadTimerange(newTimerange);
    };

    selectHour = () => {
        console.log('Select hour');
        const beginDate = moment()
            .startOf('hour')
            .toDate();
        const endDate = moment()
            .endOf('hour')
            .toDate();
        const newTimerange = new TimeRange(beginDate, endDate);
        this.props.loadTimerange(newTimerange);
    };

    render() {
        const { timerange } = this.props;
        const range: [any, any] = [moment(timerange[0]), moment(timerange[1])];
        console.log('Have timerange in Search:', timerange);
        return (
            <Flex py={1}>
                <Box px={1}>
                    <Button onClick={this.selectYesterday}>Yesterday</Button>
                </Box>
                <Box px={1}>
                    <RangePicker value={range} onChange={this.onChange} />
                </Box>
                <Box px={1}>
                    <Button onClick={this.selectToday}>Today</Button>
                </Box>
                <Box px={1}>
                    <Button onClick={this.selectHour}>Hour</Button>
                </Box>
            </Flex>
        );
    }
}
