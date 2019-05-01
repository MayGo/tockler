import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Moment } from 'moment';
import { SummaryCalendar } from './SymmaryCalendar';
import _ from 'lodash';

const mapDispatchToProps = (dispatch: any) => ({
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
    undefined,
    mapDispatchToProps,
)(SummaryCalendar);
