import * as React from 'react';
import { connect, MapStateToProps } from 'react-redux';
import IStoreState from '../../store/IStoreState';
import { ITrackItemState } from '../../store/reducers/trackItem/ITrackItemState';
import { TrackItemList } from '../../components/TrackItemList/TrackItemList';

interface IProps {
    className?: string;
}

interface IHocProps {
    trackItem: ITrackItemState;
}

type IFullProps = IProps & IHocProps;

const TrackItemListContainer = ({ className, trackItem }: IFullProps) => {
    return <TrackItemList className={className} trackItems={trackItem.all} />;
};

const mapStateToProps: MapStateToProps<
    { trackItem: ITrackItemState },
    IProps
> = (state: IStoreState, ownProps?: IProps) => ({
    trackItem: state.trackItem
});

export default connect(mapStateToProps, undefined)(TrackItemListContainer);
