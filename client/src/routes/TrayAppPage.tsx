import { Box, Divider } from '@chakra-ui/react';
import deepEqual from 'fast-deep-equal/es6';
import { throttle } from 'lodash';
import { memo, useCallback, useEffect, useState } from 'react';
import { ITrackItem } from '../@types/ITrackItem';
import { OnlineChart } from '../components/TrayLayout/OnlineChart';
import { TrayLayout } from '../components/TrayLayout/TrayLayout';
import { TrayList } from '../components/TrayList/TrayList';
import { TrackItemType } from '../enum/TrackItemType';
import { useInterval } from '../hooks/intervalHook';
import { useWindowFocused } from '../hooks/windowFocusedHook';
import { Logger } from '../logger';
import { EventEmitter } from '../services/EventEmitter';
import { getRunningLogItem } from '../services/settings.api';
import { findFirstLogItems, startNewLogItem, stopRunningLogItem } from '../services/trackItem.api';
import { useTrayStoreActions, useTrayStoreState } from '../store/easyPeasy';
import { sendOpenTrayEvent } from '../useGoogleAnalytics.utils';
import { TrayItemEdit } from './tray/TrayItemEdit';

const EMPTY_ARRAY = [];
const BG_SYNC_DELAY_MS = 10000;

const TrayAppPageTemp = () => {
    const fetchTimerange = useTrayStoreActions((actions) => actions.fetchTimerange);
    const bgSyncInterval = useTrayStoreActions((actions) => actions.bgSyncInterval);

    useInterval(() => {
        bgSyncInterval();
    }, BG_SYNC_DELAY_MS);

    useEffect(() => {
        fetchTimerange();
    }, [fetchTimerange]);

    const [loading, setLoading] = useState(true);

    const [runningLogItem, setRunningLogItem] = useState<ITrackItem>();
    const [lastLogItems, setLastLogItems] = useState<ITrackItem[]>(EMPTY_ARRAY);

    const { windowIsActive } = useWindowFocused();

    const loadLastLogItems = async () => {
        setLoading(true);
        try {
            const items = await findFirstLogItems();
            const areEqual = deepEqual(items, lastLogItems);

            if (!areEqual) {
                console.info('setLastLogItems', items);
                setLastLogItems(items);
            }
        } catch (e) {
            Logger.error('Error  loading first last items', e);
        }
        setLoading(false);
    };

    const loadLastLogItemsThrottled = throttle(loadLastLogItems, 1000);

    useEffect(() => {
        if (windowIsActive) {
            Logger.debug('Window active:', windowIsActive);
            // loadLastLogItemsThrottled();

            sendOpenTrayEvent();
        }
    }, [windowIsActive]);

    useEffect(() => {
        const eventLogItemStarted = (logItem) => {
            const newItem: ITrackItem = JSON.parse(logItem);
            Logger.debug('log-trackItem-started:', newItem);
            setRunningLogItem(newItem);
            setLastLogItems((items) => [...items, newItem]);
        };

        EventEmitter.on('log-item-started', eventLogItemStarted);

        return () => {
            EventEmitter.off('log-item-started', eventLogItemStarted);
        };
    }, []);

    useEffect(() => {
        // loadLastLogItemsThrottled();
        loadLastLogItems();
        getRunningLogItem().then((logItem) => {
            setRunningLogItem(logItem);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const startNewLogItemEvent = useCallback((trackItem: ITrackItem) => {
        startNewLogItem(trackItem);
        loadLastLogItemsThrottled();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const stopRunningLogItemEvent = useCallback(
        () => {
            if (runningLogItem) {
                stopRunningLogItem(runningLogItem.id);
                loadLastLogItemsThrottled();
                setRunningLogItem(undefined);
            } else {
                Logger.error('No running log trackItem to stop');
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [runningLogItem, setRunningLogItem],
    );

    const timeItems = useTrayStoreState((state) => state.timeItems);
    return (
        <TrayLayout>
            <Box p={4}>
                <TrayItemEdit saveTimelineItem={startNewLogItem} />
            </Box>
            <Box px={4} pb={4}>
                <OnlineChart items={timeItems[TrackItemType.StatusTrackItem] || EMPTY_ARRAY} />
            </Box>
            <Divider borderColor="gray.200" />
            <TrayList
                lastLogItems={lastLogItems}
                runningLogItem={runningLogItem}
                stopRunningLogItem={stopRunningLogItemEvent}
                startNewLogItem={startNewLogItemEvent}
                loading={loading}
            />
        </TrayLayout>
    );
};

export const TrayAppPage = memo(TrayAppPageTemp);
