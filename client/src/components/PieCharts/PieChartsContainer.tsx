import { connect } from 'dva';
import componentQueries from 'react-component-queries';
import { PieCharts } from './PieCharts';
import { TrackItemType } from '../../enum/TrackItemType';
import moment from 'moment';
import { convertDate } from '../../constants';

const filterItems = (timeline, type) =>
    timeline[type].filter(item => {
        const itemBegin = convertDate(item.beginDate);
        const itemEnd = convertDate(item.endDate);
        const visBegin = timeline.visibleTimerange[0];
        const visEnd = timeline.visibleTimerange[1];
        return itemBegin.isBetween(visBegin, visEnd) && itemEnd.isBetween(visBegin, visEnd);
    });

const mapStateToProps = ({ timeline, settings }: any) => ({
    visibleTimerange: timeline.visibleTimerange,
    appTrackItems: filterItems(timeline, TrackItemType.AppTrackItem),
    statusTrackItems: filterItems(timeline, TrackItemType.StatusTrackItem),
    logTrackItems: filterItems(timeline, TrackItemType.LogTrackItem),
    workSettings: settings.work,
});

export const PieChartsContainer = componentQueries(({ width }) => ({
    screenWidth: width,
}))(connect(mapStateToProps)(PieCharts));
