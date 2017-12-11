import * as React from 'react';

import { TimelineContainer } from './TimelineContainer';
//import { ITrackItemState } from '../../store/reducers/trackItem/ITrackItemState';

interface IProps {}
interface IHocProps {}

type IFullProps = IProps & IHocProps;

export const TimelinePage = ({  }: IFullProps) => {
    return (
        <div>
            <TimelineContainer />
        </div>
    );
};
