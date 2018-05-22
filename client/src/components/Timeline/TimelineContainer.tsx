import { connect } from 'dva';

import componentQueries from 'react-component-queries';
import { Timeline } from './Timeline';
import { TrackItemType } from '../../enum/TrackItemType';

const mapStateToProps = ({ timeline, loading }: any) => ({
    timerange: timeline.timerange,
    isRowEnabled: timeline.isRowEnabled,
    visibleTimerange: timeline.visibleTimerange,
    selectedTimelineItem: timeline.selectedTimelineItem,
    appTrackItems: timeline[TrackItemType.AppTrackItem],
    statusTrackItems: timeline[TrackItemType.StatusTrackItem],
    logTrackItems: timeline[TrackItemType.LogTrackItem],
    loading: loading.models.timeline,
});
const mapDispatchToProps = (dispatch: any) => ({
    changeVisibleTimerange: (visibleTimerange: any) =>
        dispatch({
            type: 'timeline/changeVisibleTimerange',
            payload: { visibleTimerange },
        }),
    selectTimelineItem: (item: any) =>
        dispatch({
            type: 'timeline/selectTimelineItem',
            payload: { item },
        }),
    toggleRow: (rowId: any) =>
        dispatch({
            type: 'timeline/toggleRow',
            payload: { rowId },
        }),
});
export const TimelineContainer = componentQueries(({ width }) => ({
    chartWidth: width,
}))(connect(mapStateToProps, mapDispatchToProps)(Timeline));
