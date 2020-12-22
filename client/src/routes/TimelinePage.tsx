import React, { useEffect } from 'react';
import { MainLayout } from '../components/MainLayout/MainLayout';
import { PieCharts } from '../components/PieCharts/PieCharts';
import { Search } from '../components/Timeline/Search';
import { Timeline } from '../components/Timeline/Timeline';
import { TrackItemTable } from '../components/TrackItemTable/TrackItemTable';
import { useInterval } from '../hooks/intervalHook';
import { useStoreActions } from '../store/easyPeasy';

const BG_SYNC_DELAY_MS = 3000;

export function TimelinePage({ location }: any) {
    const fetchTimerange = useStoreActions(actions => actions.fetchTimerange);
    const bgSyncInterval = useStoreActions(actions => actions.bgSyncInterval);

    useInterval(() => {
        bgSyncInterval();
    }, [BG_SYNC_DELAY_MS]);

    useEffect(() => {
        fetchTimerange();
    }, [fetchTimerange]);

    return (
        <MainLayout location={location}>
            <Search />
            <Timeline />
            <PieCharts />
            <TrackItemTable />
        </MainLayout>
    );
}
