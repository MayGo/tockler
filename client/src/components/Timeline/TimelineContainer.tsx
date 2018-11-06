import { connect } from 'dva';
import * as _ from 'lodash';
import componentQueries from 'react-component-queries';
import { Timeline } from './Timeline';
import { TrackItemType } from '../../enum/TrackItemType';

const aggregateAppTrackItems = items => {
    _.reduce(
        items,
        function(result, value, key) {
            let currVal = result; // result[value.id](result[value.id] || (result[value.id] = [])).push(key);
            return currVal;
        },
        {},
    );
};

const mapStateToProps = ({ timeline, loading }: any) => ({
    timerange: timeline.timerange,
    isRowEnabled: timeline.isRowEnabled,
    visibleTimerange: timeline.visibleTimerange,
    selectedTimelineItem: timeline.selectedTimelineItem,
    appTrackItems: timeline[TrackItemType.AppTrackItem],
    aggregatedAppItems: aggregateAppTrackItems(timeline[TrackItemType.AppTrackItem]),
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
}))(
    connect(
        mapStateToProps,
        mapDispatchToProps,
    )(Timeline),
);
