import * as React from 'react';
import { connect, MapStateToProps } from 'react-redux';

import { TrackItemList } from '../../components/TrackItemList/TrackItemList';

interface IProps {
    className?: string;
}

interface IHocProps {
    trackItem: any;
}

type IFullProps = IProps & IHocProps;

const TrackItemListContainer = ({ className, trackItem }: IFullProps) => {
    return <TrackItemList className={className} trackItems={trackItem.all} />;
};

const mapStateToProps: MapStateToProps<any, IProps> = (state: any, ownProps?: IProps) => ({
    trackItem: state.trackItem,
});

export default connect(mapStateToProps, undefined)(TrackItemListContainer);
