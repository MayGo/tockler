import * as React from 'react';
import { TimelineContainer } from '../components/Timeline/TimelineContainer';
import { Search } from '../components/Timeline/Search';
import { TrackItemTableContainer } from '../components/TrackItemTable/TrackItemTableContainer';
import { MainLayout } from '../components/MainLayout/MainLayout';
import { PieCharts } from '../components/PieCharts/PieCharts';
import moment from 'moment';
import { TimelineRowType } from '../enum/TimelineRowType';
import { TrackItemService } from '../services/TrackItemService';
import { TimelineContext } from '../TimelineContext';

const rowEnabledDefaults = {
    [TimelineRowType.App]: true,
    [TimelineRowType.Log]: true,
    [TimelineRowType.Status]: true,
};

export function TimelinePage({ location }: any) {
    const {
        timerange,
        visibleTimerange,
        setVisibleTimerange,
        timeItems,
        loadTimerange,
    } = React.useContext(TimelineContext);

    const [isRowEnabled, setIsRowEnabled] = React.useState<any>(rowEnabledDefaults);

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
                loadTimerange={loadTimerange}
                timerange={timerange}
            />

            <TimelineContainer {...timelineProps} />
            <PieCharts visibleTimerange={visibleTimerange} timeItems={timeItems} />
            <TrackItemTableContainer visibleTimerange={visibleTimerange} timeItems={timeItems} />
        </MainLayout>
    );
}
