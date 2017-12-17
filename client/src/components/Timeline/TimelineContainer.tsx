import * as React from 'react';
import { connect } from 'dva';

import IStoreState from '../../store/IStoreState';
import { changeTimerange } from '../../store/reducers/timeline/timelineActions';
import { Timeline } from './TimelineComponent';
import { TrackItemType } from '../../enum/TrackItemType';

interface IProps {}
interface IHocProps {
    timerange: any;
    appTrackItems: any;
    statusTrackItems: any;
    changeTimerange?: (timerange: any) => void;
}

type IFullProps = IProps & IHocProps;

const mapStateToProps = ({ timeline }: any) => ({
    timerange: timeline.timerange,
    appTrackItems: timeline[TrackItemType.AppTrackItem],
    statusTrackItems: timeline[TrackItemType.StatusTrackItem],
});
const mapDispatchToProps = dispatch => ({
    changeTimerange: (timerange: any) =>
        dispatch({
            type: 'timeline/changeTimerange',
            payload: { timerange },
        }),
});

export const TimelineContainer = connect(mapStateToProps, null)(Timeline);
