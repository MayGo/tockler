import { Flex } from 'reflexbox';
import { Calendar, Spin } from 'antd';
import { CoffeeOutlined, EyeOutlined, LaptopOutlined, ToolOutlined } from '@ant-design/icons';
import moment from 'moment';
import React, { useContext, useEffect } from 'react';
import useReactRouter from 'use-react-router';
import { SummaryContext } from '../../SummaryContext';
import { Spinner } from '../Timeline/Timeline.styles';
import { Item, TaskList } from './SummaryCalendar.styles';
import { Logger } from '../../logger';
import { convertDate, TIME_FORMAT_SHORT } from '../../constants';
import { formatDuration } from './SummaryCalendar.util';
import classNames from 'classnames';
import padStart from 'lodash/padStart';
import { DAY_MONTH_FORMAT } from '../../SummaryContext.util';
import { useStoreActions, useStoreState } from '../../store/easyPeasy';

moment.locale('et');

const icons = {
    coffee: <CoffeeOutlined />,
    'eye-invisible': <EyeOutlined />,
    laptop: <LaptopOutlined />,
    tool: <ToolOutlined />,
};
export const SummaryCalendar = () => {
    const timerange = useStoreState(state => state.timerange);
    const loadTimerange = useStoreActions(state => state.loadTimerange);

    const {
        selectedDate,
        setSelectedDate,
        selectedMode,
        setSelectedMode,
        logSummary,
        onlineSummary,
        onlineTimesSummary,
        isLoading,
    } = useContext(SummaryContext);

    const { history } = useReactRouter();

    const onDateClicked = (date: any) => {
        if (!date) {
            Logger.error('No date');
            return;
        }

        loadTimerange([date.clone().startOf('day'), date.clone().endOf('day')]);
        history.push('/app/timeline');
    };

    const changeSelectedDate = (date?: any, mode?: 'month' | 'year') => {
        setSelectedDate(date);
        setSelectedMode(mode);
    };

    useEffect(() => {
        setSelectedDate(timerange[0]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getListData = day => {
        const listData: any[] = [];

        const times = onlineTimesSummary[day];
        if (times) {
            listData.push({
                type: 'coffee',
                content: `Wake time ${convertDate(times.beginDate).format(TIME_FORMAT_SHORT)}`,
            });
            listData.push({
                type: 'eye-invisible',
                content: `Sleep time ${convertDate(times.endDate).format(TIME_FORMAT_SHORT)}`,
            });
        }

        const online = onlineSummary[day];
        if (online) {
            listData.push({ type: 'laptop', content: `Worked  ${formatDuration(online)}` });
        }

        const worked = logSummary[day];
        if (worked) {
            listData.push({ type: 'tool', content: `Tasks  ${formatDuration(worked)}` });
        }
        return listData || [];
    };

    const dateCellRender = value => {
        if (value.month() === selectedDate.month()) {
            const listData = getListData(value.format(DAY_MONTH_FORMAT));
            return (
                <TaskList>
                    {listData.map(item => (
                        <Item key={item.content}>
                            {icons[item.type]}
                            {'  '}
                            {item.content}
                        </Item>
                    ))}
                </TaskList>
            );
        }
        return null;
    };

    const dateFullCellRender = date => {
        let style = {};

        const day = date.day();
        const isWeekend = day === 6 || day === 0;
        const isToday = moment().isSame(date, 'day');
        if (isWeekend) {
            if (isToday) {
                style = { background: '#e6f7ff' };
            } else {
                style = { background: 'rgb(230, 230, 230, 0.2)' };
            }
        }
        return (
            <div
                className={classNames(`ant-picker-cell-inner ant-picker-calendar-date`, {
                    [`ant-picker-selected`]: moment().isSame(date, 'day'),
                })}
                style={style}
                onClick={() => onDateClicked(date)}
            >
                <div className={`ant-picker-calendar-date-value`}>
                    {padStart(date.date(), 2, '0')}
                </div>
                <div className={`ant-picker-calendar-date-content`}>
                    {dateCellRender && dateCellRender(date)}
                </div>
            </div>
        );
    };

    const monthCellRender = value => {
        const listData = getListData(value.month());
        return (
            <TaskList>
                {listData.map(item => (
                    <Item key={item.content}>
                        {icons[item.type]}
                        {'  '}
                        {item.content}
                    </Item>
                ))}
            </TaskList>
        );
    };

    return (
        <Flex p={1}>
            {isLoading && (
                <Spinner>
                    <Spin />
                </Spinner>
            )}
            <Calendar
                value={selectedDate}
                mode={selectedMode}
                dateCellRender={dateCellRender}
                dateFullCellRender={dateFullCellRender}
                monthCellRender={monthCellRender}
                onPanelChange={changeSelectedDate}
            />
        </Flex>
    );
};
