import * as React from 'react';
import { Calendar, Badge } from 'antd';
import { Flex } from 'grid-styled';

import { TaskList, Item } from './SummaryCalendar.styles';
import moment from 'moment';

interface IProps {
    appSummary: any;
    onlineSummary: any;
    logSummary: any;
    selectedDate: any;
    changeSelectedDate: any;
}
export class SummaryCalendar extends React.Component<IProps, {}> {
    getListData(day) {
        const { logSummary, onlineSummary } = this.props;

        let listData: Array<any> = [];
        const worked = logSummary[day.date()];
        if (worked) {
            let formattedDuration = moment.duration(worked).format();
            listData.push({ type: 'warning', content: `Worked: ${formattedDuration}` });
        }

        const online = onlineSummary[day.date()];
        if (online) {
            let formattedDuration = moment.duration(online).format();
            listData.push({ type: 'success', content: `Online: ${formattedDuration}` });
        }

        return listData || [];
    }
    dateCellRender = value => {
        const listData = this.getListData(value);
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

    getMonthData(value) {
        if (value.month() === 8) {
            return 1394;
        }
        return null;
    }

    monthCellRender(value) {
        const num = this.getMonthData(value);
        return num ? (
            <div className="notes-month">
                <section>{num}</section>
                <span>Backlog number</span>
            </div>
        ) : null;
    }

    onPanelChange = value => {
        this.setState({ value });
    };

    render() {
        const { changeSelectedDate, selectedDate } = this.props;
        console.log('Render SummaryCalendar', this.state);

        return (
            <div>
                <Flex p={1}>
                    <Calendar
                        value={selectedDate}
                        dateCellRender={this.dateCellRender}
                        monthCellRender={this.monthCellRender}
                        onPanelChange={changeSelectedDate}
                    />
                </Flex>
            </div>
        );
    }
}
