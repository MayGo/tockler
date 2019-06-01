import * as React from 'react';
import { Timeline } from './Timeline';
import useWindowSize from '@rehooks/window-size';

const TimelineInt = props => {
    const [selectedTimelineItem, setSelectedTimelineItem] = React.useState<any>();
    const { innerWidth } = useWindowSize();
    const toggleRow = (rowId: any) => {
        /*
dispatch({
        type: 'timeline/toggleRow',
        payload: { rowId },
    }),
*/
    };
    const selectTimelineItem = item => {};
    const changeVisibleTimerange = visibleTimerange => {
        //visibleTimerange: [moment(visibleTimerange[0]), moment(visibleTimerange[1])],
    };
    const moreProps = {
        toggleRow,
        selectTimelineItem,
        changeVisibleTimerange,
        chartWidth: innerWidth,
    };
    return <Timeline {...props} {...moreProps} />;
};
export const TimelineContainer = TimelineInt;
