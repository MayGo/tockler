import { connect } from 'dva';
import { TrackItemTable } from './TrackItemTable';
import { TrackItemType } from '../../enum/TrackItemType';
import { convertDate } from '../../constants';

const filterItems = (timeline, type) =>
    timeline[type].filter(item => {
        const itemBegin = convertDate(item.beginDate);
        const itemEnd = convertDate(item.endDate);
        const visBegin = timeline.visibleTimerange[0];
        const visEnd = timeline.visibleTimerange[1];
        return itemBegin.isBetween(visBegin, visEnd) && itemEnd.isBetween(visBegin, visEnd);
    });

const mapStateToProps = ({ timeline }: any) => ({
    visibleTimerange: timeline.visibleTimerange,
    appTrackItems: filterItems(timeline, TrackItemType.AppTrackItem),
    logTrackItems: filterItems(timeline, TrackItemType.LogTrackItem),
});

const mapDispatchToProps = (dispatch: any) => ({
    deleteTimelineItems: (ids: any) => {
        dispatch({
            type: 'timeline/deleteTimelineItems',
            payload: { ids },
        });
    },
});

export const TrackItemTableContainer = connect(
    mapStateToProps,
    mapDispatchToProps,
)(TrackItemTable);
