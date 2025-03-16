import { useEffect, useState } from 'react';
import { ITrackItem } from '../@types/ITrackItem';
import { getTodayTimerange } from '../components/Timeline/timeline.utils';
import { TrackItemType } from '../enum/TrackItemType';
import { Logger } from '../logger';
import { ElectronEventEmitter } from '../services/ElectronEventEmitter';
import { getRunningLogItem } from '../services/settings.api';
import { findAllDayItems, findFirstChunkLogItems } from '../services/trackItem.api';

export const useTrayData = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [statusItems, setStatusItems] = useState<ITrackItem[]>([]);
    const [logItems, setLogItems] = useState<ITrackItem[]>([]);
    const [runningLogItem, setRunningLogItem] = useState<ITrackItem>();

    // Listen for log item events
    useEffect(() => {
        const eventLogItemStarted = (logItem) => {
            const newItem: ITrackItem = JSON.parse(logItem);
            Logger.debug('log-trackItem-started:', newItem);
            setRunningLogItem(newItem);
        };

        ElectronEventEmitter.on('log-item-started', eventLogItemStarted);

        return () => {
            ElectronEventEmitter.off('log-item-started', eventLogItemStarted);
        };
    }, []);

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
            const items = await findFirstChunkLogItems();
            setLogItems(items);
            // Logger.debug('TrayApp - Log items loaded:', items);
            return items;
        } catch (error) {
            Logger.error('Error fetching log items:', error);
            return [];
        }
    }

    async function fetchRunningLogItem() {
        Logger.debug('TrayApp - Loading running log item');

        try {
            const logItem = await getRunningLogItem();
            setRunningLogItem(logItem);
            Logger.debug('TrayApp - Running log item loaded:', logItem);
            return logItem;
        } catch (error) {
            Logger.error('Error fetching running log item:', error);
            return undefined;
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
            await Promise.all([fetchStatusItems(), fetchLogItems(), fetchRunningLogItem()]);
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
        runningLogItem,
        setRunningLogItem,
        fetchStatusItems,
        fetchLogItems,
        fetchRunningLogItem,
        refreshData,
    };
};
