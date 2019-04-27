import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { TrackItemType } from '../../enum/TrackItemType';
import moment, { Moment } from 'moment';
import { SummaryCalendar } from './SymmaryCalendar';
import _ from 'lodash';
import { convertDate } from '../../constants';

const groupByField = mode => item =>
    mode === 'month' ? convertDate(item.beginDate).date() : convertDate(item.beginDate).month();

const summariseLog = (items, mode) => {
    let data = {};

    _(items)
        .groupBy(groupByField(mode))
        .forEach((value, key) => {
            data[key] = _.sumBy(value, c => convertDate(c.endDate).diff(convertDate(c.beginDate)));
        });

    return data;
};

const summariseOnline = (items, mode) => {
    let data = {};

    _(items)
        .filter(item => item.app === 'ONLINE')
        .groupBy(groupByField(mode))
        .forEach((value, key) => {
            data[key] = _.sumBy(value, c => convertDate(c.endDate).diff(convertDate(c.beginDate)));
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
    onDateSelect: (selectedDate: Moment) => {
        const pathname = '/app/timeline';
        dispatch({
            type: 'timeline/setTimerange',
            payload: { timerange: [selectedDate.startOf('day'), selectedDate.endOf('day')] },
        });
        dispatch(
            routerRedux.push({
                pathname,
            }),
        );
    },
});

export const SummaryCalendarContainer = connect(
    mapStateToProps,
    mapDispatchToProps,
)(SummaryCalendar);
