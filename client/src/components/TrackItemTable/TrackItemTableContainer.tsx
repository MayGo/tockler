import { connect } from 'dva';

import { TrackItemTable } from './TrackItemTable';
import { TrackItemType } from '../../enum/TrackItemType';

const mapStateToProps = ({ timeline }: any) => ({
    visibleTimerange: timeline.visibleTimerange,
    appTrackItems: timeline[TrackItemType.AppTrackItem],
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
