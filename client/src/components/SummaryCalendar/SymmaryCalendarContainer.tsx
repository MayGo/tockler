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

const mapStateToProps = ({ summary, loading }: any) => ({
    selectedDate: summary.selectedDate,
    logSummary: summariseLog(summary[TrackItemType.LogTrackItem], summary.selectedMode),
    onlineSummary: summariseOnline(summary[TrackItemType.StatusTrackItem], summary.selectedMode),
    loading: loading.models.summary,
});
const mapDispatchToProps = (dispatch: any) => ({
    changeSelectedDate: (selectedDate: Moment, selectedMode: 'month' | 'year') =>
        dispatch({
            type: 'summary/loadSummary',
            payload: { selectedDate, selectedMode },
        }),
});

export const SummaryCalendarContainer = connect(
    mapStateToProps,
    mapDispatchToProps,
)(SummaryCalendar);
