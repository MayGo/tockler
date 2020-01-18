import { Flex } from '@rebass/grid';
import { Calendar, Spin, Icon } from 'antd';
import moment, { Moment } from 'moment';

import React, { useContext } from 'react';
import useReactRouter from 'use-react-router';
import { TimelineContext } from '../../TimelineContext';
import { SummaryContext } from '../../SummaryContext';
import { Spinner } from '../Timeline/Timeline.styles';
import { Item, TaskList } from './SummaryCalendar.styles';
import { Logger } from '../../logger';
import { convertDate, TIME_FORMAT_SHORT } from '../../constants';
import { formatDuration } from './SummaryCalendar.util';
import classNames from 'classnames';
import padStart from 'lodash/padStart';

moment.locale('et');

export const SummaryCalendar = () => {
    const { loadTimerange } = useContext(TimelineContext);
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

    const onDateSelect = (date: Moment | undefined) => {
        const pathname = '/app/timeline';
        if (date) {
            loadTimerange([date.clone().startOf('day'), date.clone().endOf('day')]);
            history.push(pathname);
        } else {
            Logger.error('No date');
        }
    };

    const changeSelectedDate = (date?: Moment, mode?: 'month' | 'year') => {
        setSelectedDate(date);
        setSelectedMode(mode);
    };

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
            const listData = getListData(value.date());
            return (
                <TaskList>
                    {listData.map(item => (
                        <Item key={item.content}>
                            <Icon type={item.type} theme="outlined" />
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
        const prefixCls = 'ant';
        const calendarPrefixCls = `${prefixCls}-fullcalendar`;
        let style = {};

        const day = date.day();
        const isWeekend = day === 6 || day === 0;
        const isToday = moment().isSame(date, 'day');
        if (isWeekend) {
            if (isToday) {
                style = { background: '#e6f7ff' };
            } else {
                style = { background: 'rgb(230, 230, 230)' };
            }
        }
        return (
            <div
                className={classNames(`${prefixCls}-cell-inner`, `${calendarPrefixCls}-date`, {
                    [`${calendarPrefixCls}-date-today`]: moment().isSame(date, 'day'),
                })}
                style={style}
            >
                <div className={`${calendarPrefixCls}-date-value`}>
                    {padStart(date.date(), 2, '0')}
                </div>
                <div className={`${calendarPrefixCls}-date-content`}>
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
                        <Icon type={item.type} theme="outlined" />
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
                onSelect={onDateSelect}
                dateCellRender={dateCellRender}
                dateFullCellRender={dateFullCellRender}
                monthCellRender={monthCellRender}
                onPanelChange={changeSelectedDate}
            />
        </Flex>
    );
};
