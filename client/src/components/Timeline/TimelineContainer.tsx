import * as React from 'react';
import { connect, MapStateToProps } from 'react-redux';
import Timeline from '../../components/Timeline/Timeline';
import IStoreState from '../../store/IStoreState';
//import { ITrackItemState } from '../../store/reducers/trackItem/ITrackItemState';

interface IProps {}
interface IHocProps {
    timelineItems: any;
}

type IFullProps = IProps & IHocProps;

const TimelineContainer = ({ timelineItems }: IFullProps) => {
    console.log('Loaded items', timelineItems);
    return <Timeline timerange={timelineItems} />;
};

const mapStateToProps: MapStateToProps<{ timelineItems: any[] }, IProps> = (
    state: IStoreState,
    ownProps?: IProps
) => ({
    timelineItems: state.timeline.all
});

export default connect(mapStateToProps, undefined)(TimelineContainer);
