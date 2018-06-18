import * as React from 'react';
import { Calendar, Badge } from 'antd';
import { Flex } from 'grid-styled';

import { TaskList, Item } from './SummaryCalendar.styles';
import moment, { Moment } from 'moment';

interface IProps {
    appSummary: any;
    onlineSummary: any;
    logSummary: any;
    selectedDate: Moment;
    selectedMode: 'month' | 'year';
    changeSelectedDate: any;
}
export class SummaryCalendar extends React.Component<IProps, {}> {
    getListData(day) {
        const { logSummary, onlineSummary } = this.props;

        let listData: Array<any> = [];
        const worked = logSummary[day];
        if (worked) {
            let formattedDuration = moment.duration(worked).format();
            listData.push({ type: 'warning', content: `Worked: ${formattedDuration}` });
        }

        const online = onlineSummary[day];
        if (online) {
            let formattedDuration = moment.duration(online).format();
            listData.push({ type: 'success', content: `Online: ${formattedDuration}` });
        }

        return listData || [];
    }

    dateCellRender = value => {
        const listData = this.getListData(value.date());
        return (
            <TaskList>
                {listData.map(item => (
                    <Item key={item.content}>
                        <Badge status={item.type} text={item.content} />
                    </Item>
                ))}
            </TaskList>
        );
    };

    monthCellRender = value => {
        const listData = this.getListData(value.month());
        return (
            <TaskList>
                {listData.map(item => (
                    <Item key={item.content}>
                        <Badge status={item.type} text={item.content} />
                    </Item>
                ))}
            </TaskList>
        );
    };

    render() {
        const { changeSelectedDate, selectedDate, selectedMode } = this.props;
        console.log('Render SummaryCalendar', this.state);

        return (
            <div>
                <Flex p={1}>
                    <Calendar
                        value={selectedDate}
                        mode={selectedMode}
                        dateCellRender={this.dateCellRender}
                        monthCellRender={this.monthCellRender}
                        onPanelChange={changeSelectedDate}
                    />
                </Flex>
            </div>
        );
    }
}
