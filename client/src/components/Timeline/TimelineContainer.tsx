import * as React from 'react';
import { connect, MapStateToProps } from 'react-redux';
import Timeline from '../../components/Timeline/Timeline';
import IStoreState from '../../store/IStoreState';
import { Dispatch } from '../../store/reducers/index';
import { changeTimerange } from '../../store/reducers/timeline/timelineActions';
//import { ITrackItemState } from '../../store/reducers/trackItem/ITrackItemState';

interface IProps {}
interface IHocProps {
    series: any;
    timerange: any;
    changeTimerange: (timerange: any) => void;
}

type IFullProps = IProps & IHocProps;

const TimelineContainer = ({
    series,
    timerange,
    changeTimerange
}: IFullProps) => {
    console.log('Loaded items', series);
    return (
        <Timeline
            series={series}
            timerange={timerange}
            changeTimerange={changeTimerange}
        />
    );
};

const mapStateToProps: MapStateToProps<
    { series: any[]; timerange: any },
    IProps
> = (state: IStoreState, ownProps?: IProps) => ({
    series: state.timeline.series,
    timerange: state.timeline.timerange
});

const mapDispatchToProps = (dispatch: Dispatch, ownProps: IProps) => {
    return {
        changeTimerange: (timerange: any) =>
            dispatch(changeTimerange(timerange))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(TimelineContainer);
