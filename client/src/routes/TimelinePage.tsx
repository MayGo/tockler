import * as React from 'react';

import { TimelineContainer } from '../components/Timeline/TimelineContainer';
import { SearchContainer } from '../components/Timeline/SearchContainer';
import { connect } from 'dva';
import { TrackItemTableContainer } from '../components/TrackItemTable/TrackItemTableContainer';
import { MainLayout } from '../components/MainLayout/MainLayout';
import { PieChartsContainer } from '../components/PieCharts/PieChartsContainer';

function Timeline({ location }: any) {
    return (
        <MainLayout location={location}>
            <SearchContainer />

            <TimelineContainer />
            <PieChartsContainer />
            <TrackItemTableContainer />
        </MainLayout>
    );
}

export const TimelinePage = connect()(Timeline);
