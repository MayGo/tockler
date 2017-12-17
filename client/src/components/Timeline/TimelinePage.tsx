import * as React from 'react';

import { TimelineContainer } from './TimelineContainer';
import { Search } from './Search';

interface IProps {}
interface IHocProps {}

type IFullProps = IProps & IHocProps;

export const TimelinePage = ({  }: IFullProps) => {
    return (
        <div>
            <Search selectedDateTime={new Date()} />
            <TimelineContainer />
        </div>
    );
};
