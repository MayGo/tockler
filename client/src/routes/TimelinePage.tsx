import * as React from 'react';
import { Timeline } from '../components/Timeline/Timeline';
import { Search } from '../components/Timeline/Search';
import { TrackItemTableContainer } from '../components/TrackItemTable/TrackItemTableContainer';
import { MainLayout } from '../components/MainLayout/MainLayout';
import { PieCharts } from '../components/PieCharts/PieCharts';
import moment from 'moment';
import { TimelineRowType } from '../enum/TimelineRowType';
import { TrackItemService } from '../services/TrackItemService';
import { TimelineContext } from '../TimelineContext';

export function TimelinePage({ location }: any) {
    const {
        timerange,
        visibleTimerange,
        setVisibleTimerange,
        timeItems,
        loadTimerange,
    } = React.useContext(TimelineContext);

    const timelineProps = {
        timerange,
        visibleTimerange,
        setVisibleTimerange,
        timeItems,
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
            <TrackItemTableContainer visibleTimerange={visibleTimerange} timeItems={timeItems} />
        </MainLayout>
    );
}
