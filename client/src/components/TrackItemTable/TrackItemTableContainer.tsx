import { connect } from 'dva';

import { TrackItemTable } from './TrackItemTable';
import { TrackItemType } from '../../enum/TrackItemType';
import moment from 'moment';

const filterItems = timeline =>
    timeline[TrackItemType.AppTrackItem].filter(item => {
        const itemBegin = new Date(item.beginDate);
        const itemEnd = new Date(item.endDate);
        const visBegin = new Date(timeline.visibleTimerange[0]);
        const visEnd = new Date(timeline.visibleTimerange[1]);
        return (
            moment(itemBegin).isBetween(visBegin, visEnd) &&
            moment(itemEnd).isBetween(visBegin, visEnd)
        );
    });

const mapStateToProps = ({ timeline }: any) => ({
    visibleTimerange: timeline.visibleTimerange,
    appTrackItems: filterItems(timeline),
    statusTrackItems: timeline[TrackItemType.StatusTrackItem],
});
const mapDispatchToProps = (dispatch: any) => ({
    changeTimerange: (timerange: any) =>
        dispatch({
            type: 'timeline/changeVisibleTimerange',
            payload: { timerange },
        }),
});

export const TrackItemTableContainer = connect(mapStateToProps, mapDispatchToProps)(TrackItemTable);
