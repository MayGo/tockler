import { connect } from 'dva';

import { TrackItemType } from '../../enum/TrackItemType';
import moment, { Moment } from 'moment';
import { SummaryCalendar } from './SymmaryCalendar';
import _ from 'lodash';

const groupByField = mode => item =>
    mode === 'month' ? moment(item.beginDate).date() : moment(item.beginDate).month();

const summariseLog = (items, mode) => {
    let data = {};

    _(items)
        .groupBy(groupByField(mode))
        .forEach((value, key) => {
            data[key] = _.sumBy(value, c => moment(c.endDate).diff(c.beginDate));
        });

    return data;
};

const summariseOnline = (items, mode) => {
    let data = {};

    _(items)
        .filter(item => item.app === 'ONLINE')
        .groupBy(groupByField(mode))
        .forEach((value, key) => {
            data[key] = _.sumBy(value, c => moment(c.endDate).diff(c.beginDate));
        });
    return data;
};

const mapStateToProps = ({ summary }: any) => ({
    selectedDate: summary.selectedDate,
    logSummary: summariseLog(summary[TrackItemType.LogTrackItem], summary.selectedMode),
    onlineSummary: summariseOnline(summary[TrackItemType.StatusTrackItem], summary.selectedMode),
});
const mapDispatchToProps = (dispatch: any) => ({
    changeSelectedDate: (selectedDate: Moment, mode: 'month' | 'year') =>
        dispatch({
            type: 'summary/changeSelectedDate',
            payload: { selectedDate, mode },
        }),
});

export const SummaryCalendarContainer = connect(
    mapStateToProps,
    mapDispatchToProps,
)(SummaryCalendar);
