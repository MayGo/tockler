// NOT USED

import * as React from 'react';
import { connect, MapStateToProps } from 'react-redux';

import { TrackItemType } from '../../enum/TrackItemType';
import { TimelineRow } from './TimelineRow';

interface IProps {
    trackItemType: TrackItemType;
    series?: any;
}
interface IHocProps {
    series: any;
}

const TimelineRow2 = ({ series }: IHocProps) => {
    console.log('Loaded ROW', series);
    return <TimelineRow series={series} />;
};

const mapStateToProps: MapStateToProps<{ series: any }, IProps> = (
    state: any,
    ownProps: IProps,
) => ({
    series: state.timeline[ownProps.trackItemType],
});

export const TimelineRowContainer = connect(mapStateToProps, null)(TimelineRow2);
