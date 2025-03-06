import { useState } from 'react';
import { ITrackItem } from '../@types/ITrackItem';
import { getTodayTimerange } from '../components/Timeline/timeline.utils';
import { TrackItemType } from '../enum/TrackItemType';
import { Logger } from '../logger';
import { findAllDayItems, findFirstLogItems } from '../services/trackItem.api';

export const useTrayData = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [statusItems, setStatusItems] = useState<ITrackItem[]>([]);
    const [logItems, setLogItems] = useState<ITrackItem[]>([]);

    async function fetchStatusItems() {
        const timerange = getTodayTimerange();
        Logger.debug('TrayApp - Loading status items:', JSON.stringify(timerange));

        try {
            // Only fetch status items
            const items = await findAllDayItems(timerange[0], timerange[1], TrackItemType.StatusTrackItem);
            setStatusItems(items);
            return items;
        } catch (error) {
            Logger.error('Error fetching status items:', error);
            return [];
        }
    }

    async function fetchLogItems() {
        Logger.debug('TrayApp - Loading log items');

        try {
            const items = await findFirstLogItems();
            setLogItems(items);
            return items;
        } catch (error) {
            Logger.error('Error fetching log items:', error);
            return [];
        }
    }

    // Fetch both status and log items
    async function refreshData() {
        // Prevent multiple simultaneous refreshes
        if (isLoading) {
            Logger.debug('Already loading data, skipping refresh');
            return;
        }

        setIsLoading(true);
        Logger.debug('Starting data refresh');

        try {
            await Promise.all([fetchStatusItems(), fetchLogItems()]);
            Logger.debug('Data refresh completed');
        } catch (error) {
            Logger.error('Error during data refresh:', error);
        } finally {
            setIsLoading(false);
        }
    }

    return {
        isLoading,
        statusItems,
        logItems,
        fetchStatusItems,
        fetchLogItems,
        refreshData,
    };
};
