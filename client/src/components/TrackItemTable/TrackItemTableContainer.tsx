import { connect } from 'dva';

import { TrackItemTable } from './TrackItemTable';
import { TrackItemType } from '../../enum/TrackItemType';
import moment from 'moment';
import { convertDate } from '../../constants';

const filterItems = (timeline, type) =>
    timeline[type].filter(item => {
        const itemBegin = convertDate(item.beginDate);
        const itemEnd = convertDate(item.endDate);
        const visBegin = convertDate(timeline.visibleTimerange[0]);
        const visEnd = convertDate(timeline.visibleTimerange[1]);
        return itemBegin.isBetween(visBegin, visEnd) && itemEnd.isBetween(visBegin, visEnd);
    });

const mapStateToProps = ({ timeline }: any) => ({
    visibleTimerange: timeline.visibleTimerange,
    appTrackItems: filterItems(timeline, TrackItemType.AppTrackItem),
    logTrackItems: filterItems(timeline, TrackItemType.LogTrackItem),
});
const mapDispatchToProps = (dispatch: any) => ({
    changeTimerange: (timerange: any) =>
        dispatch({
            type: 'timeline/changeVisibleTimerange',
            payload: { timerange },
        }),
});

export const TrackItemTableContainer = connect(
    mapStateToProps,
    mapDispatchToProps,
)(TrackItemTable);
