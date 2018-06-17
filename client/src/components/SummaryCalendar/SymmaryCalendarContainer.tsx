import { connect } from 'dva';

import { TrackItemType } from '../../enum/TrackItemType';
import moment from 'moment';
import { SummaryCalendar } from './SymmaryCalendar';
import _ from 'lodash';

const sumApp = (p, c) => {
    return _.extend(p, {
        timeDiffInMs: p.timeDiffInMs + moment(c.endDate).diff(c.beginDate),
    });
};
const groupByField = item => moment(item.beginDate).date();

const summariseLog = items => {
    let data = {};

    _(items)
        .groupBy(groupByField)

        .forEach((value, key) => {
            data[key] = _.sumBy(value, c => moment(c.endDate).diff(c.beginDate));
        });
    return data;
};

const summariseOnline = items => {
    let data = {};

    _(items)
        .filter(item => item.app === 'ONLINE')
        .groupBy(groupByField)
        .forEach((value, key) => {
            data[key] = _.sumBy(value, c => moment(c.endDate).diff(c.beginDate));
        });
    return data;
};

const mapStateToProps = ({ summary }: any) => ({
    selectedDate: summary.selectedDate,
    logSummary: summariseLog(summary[TrackItemType.LogTrackItem]),
    onlineSummary: summariseOnline(summary[TrackItemType.StatusTrackItem]),
});
const mapDispatchToProps = (dispatch: any) => ({
    changeSelectedDate: (selectedDate: any) =>
        dispatch({
            type: 'summary/changeSelectedDate',
            payload: { selectedDate },
        }),
});

export const SummaryCalendarContainer = connect(
    mapStateToProps,
    mapDispatchToProps,
)(SummaryCalendar);
