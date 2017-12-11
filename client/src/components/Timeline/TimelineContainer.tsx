import * as React from 'react';
import { connect, MapStateToProps } from 'react-redux';
import IStoreState from '../../store/IStoreState';
import { Dispatch } from '../../store/reducers/index';
import { changeTimerange } from '../../store/reducers/timeline/timelineActions';
import { Timeline } from './Timeline';
//import { ITrackItemState } from '../../store/reducers/trackItem/ITrackItemState';

interface IProps {}
interface IHocProps {
    timerange: any;
    changeTimerange: (timerange: any) => void;
}

type IFullProps = IProps & IHocProps;

const TimelineContainer2 = ({ timerange, changeTimerange }: IFullProps) => {
    console.log('Loaded timerange:', timerange);
    return <Timeline timerange={timerange} changeTimerange={changeTimerange} />;
};

const mapStateToProps: MapStateToProps<{ timerange: any }, IProps> = (
    state: IStoreState,
    ownProps?: IProps
) => ({
    timerange: state.timeline.timerange
});

const mapDispatchToProps = (dispatch: Dispatch, ownProps: IProps) => {
    return {
        changeTimerange: (timerange: any) =>
            dispatch(changeTimerange(timerange))
    };
};

export const TimelineContainer = connect(mapStateToProps, mapDispatchToProps)(
    TimelineContainer2
);
