import { connect } from 'dva';

import { TrackItemTable } from './TrackItemTable';
import { TrackItemType } from '../../enum/TrackItemType';

const mapStateToProps = ({ timeline }: any) => ({
    visibleTimerange: timeline.visibleTimerange,
    appTrackItems: timeline[TrackItemType.AppTrackItem].filter(item => {
        const a = new Date(item.beginDate);
        const b = new Date(item.endDate);
        const visA = new Date(timeline.visibleTimerange[0]);
        const visB = new Date(timeline.visibleTimerange[1]);
        return a >= visA && b <= visB;
    }),
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
