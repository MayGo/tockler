import { connect } from 'dva';

import { Timeline } from './Timeline';
import { TrackItemType } from '../../enum/TrackItemType';

const mapStateToProps = ({ timeline }: any) => ({
    timerange: timeline.timerange,
    visibleTimerange: timeline.visibleTimerange,
    appTrackItems: timeline[TrackItemType.AppTrackItem],
    statusTrackItems: timeline[TrackItemType.StatusTrackItem],
    logTrackItems: timeline[TrackItemType.LogTrackItem],
});
const mapDispatchToProps = (dispatch: any) => ({
    changeTimerange: (visibleTimerange: any) =>
        dispatch({
            type: 'timeline/changeVisibleTimerange',
            payload: { visibleTimerange },
        }),
    selectTimelineItem: (item: any) =>
        dispatch({
            type: 'timeline/selectTimelineItem',
            payload: { item },
        }),
});

export const TimelineContainer = connect(mapStateToProps, mapDispatchToProps)(Timeline);
