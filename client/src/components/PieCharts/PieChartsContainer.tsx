import { connect } from 'dva';
import componentQueries from 'react-component-queries';
import { PieCharts } from './PieCharts';
import { TrackItemType } from '../../enum/TrackItemType';
import moment from 'moment';

const filterItems = (timeline, type) =>
    timeline[type].filter(item => {
        const itemBegin = new Date(item.beginDate);
        const itemEnd = new Date(item.endDate);
        const visBegin = new Date(timeline.visibleTimerange[0]);
        const visEnd = new Date(timeline.visibleTimerange[1]);
        return (
            moment(itemBegin).isBetween(visBegin, visEnd) &&
            moment(itemEnd).isBetween(visBegin, visEnd)
        );
    });

const mapStateToProps = ({ timeline, settings }: any) => ({
    visibleTimerange: timeline.visibleTimerange,
    appTrackItems: filterItems(timeline, TrackItemType.AppTrackItem),
    statusTrackItems: filterItems(timeline, TrackItemType.StatusTrackItem),
    logTrackItems: filterItems(timeline, TrackItemType.LogTrackItem),
    workSettings: settings.work,
});
const mapDispatchToProps = (dispatch: any) => ({
    changeTimerange: (timerange: any) =>
        dispatch({
            type: 'timeline/changeVisibleTimerange',
            payload: { timerange },
        }),
});

export const PieChartsContainer = componentQueries(({ width }) => ({
    screenWidth: width,
}))(connect(mapStateToProps, mapDispatchToProps)(PieCharts));
