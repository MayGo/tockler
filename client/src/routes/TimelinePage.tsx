import * as React from 'react';
import { MainLayout } from '../components/MainLayout/MainLayout';
import { PieCharts } from '../components/PieCharts/PieCharts';
import { Search } from '../components/Timeline/Search';
import { Timeline } from '../components/Timeline/Timeline';
import { TrackItemTable } from '../components/TrackItemTable/TrackItemTable';
import { TimelineContext } from '../TimelineContext';

export function TimelinePage({ location }: any) {
    const {
        timerange,
        visibleTimerange,
        setVisibleTimerange,
        timeItems,
        loadTimerange,
        isLoading,
    } = React.useContext(TimelineContext);

    const timelineProps = {
        timerange,
        visibleTimerange,
        setVisibleTimerange,
        timeItems,
        isLoading,
    };

    return (
        <MainLayout location={location}>
            <Search
                changeVisibleTimerange={setVisibleTimerange}
                loadTimerange={loadTimerange}
                timerange={timerange}
            />

            <Timeline {...timelineProps} />
            <PieCharts visibleTimerange={visibleTimerange} timeItems={timeItems} />
            <TrackItemTable visibleTimerange={visibleTimerange} timeItems={timeItems} />
        </MainLayout>
    );
}
