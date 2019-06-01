import * as React from 'react';

import { TimelineContainer } from '../components/Timeline/TimelineContainer';
import { Search } from '../components/Timeline/Search';

import { TrackItemTableContainer } from '../components/TrackItemTable/TrackItemTableContainer';
import { MainLayout } from '../components/MainLayout/MainLayout';
import { PieCharts } from '../components/PieCharts/PieCharts';
import moment from 'moment';
import { TimelineRowType } from '../enum/TimelineRowType';
import { TrackItemService } from '../services/TrackItemService';

const emptyTimeItems = {
    appItems: [],
    logItems: [],
    statusItems: [],
};

const rowEnabledDefaults = {
    [TimelineRowType.App]: true,
    [TimelineRowType.Log]: true,
    [TimelineRowType.Status]: true,
};

export function TimelinePage({ location }: any) {
    const [timerange, setTimerange] = React.useState<any>([moment().subtract(1, 'days'), moment()]);
    const [visibleTimerange, setVisibleTimerange] = React.useState<any>([
        moment().subtract(1, 'hour'),
        moment(),
    ]);
    const [timeItems, setTimeItems] = React.useState<any>(emptyTimeItems);
    const [isRowEnabled, setIsRowEnabled] = React.useState<any>(rowEnabledDefaults);

    const loadTimerange = async timerange => {
        console.log('loadTimerange:', timerange);

        const { appItems, statusItems, logItems } = await TrackItemService.findAllItems(
            timerange[0],
            timerange[1],
        );

        setTimeItems({ appItems, statusItems, logItems });
        setTimerange(timerange);
    };

    React.useEffect(() => {
        loadTimerange(timerange);
    }, [timerange]);

    const timelineProps = {
        timerange,
        visibleTimerange,
        setVisibleTimerange,
        isRowEnabled,
        setIsRowEnabled,
        timeItems,
    };
    return (
        <MainLayout location={location}>
            <Search
                changeVisibleTimerange={setVisibleTimerange}
                loadTimerange={setTimerange}
                timerange={timerange}
            />

            <TimelineContainer {...timelineProps} />
            <PieCharts visibleTimerange={visibleTimerange} timeItems={timeItems} />
            <TrackItemTableContainer visibleTimerange={visibleTimerange} timeItems={timeItems} />
        </MainLayout>
    );
}
