import { Box } from '@rebass/grid';
import React, { useEffect, useState, useCallback } from 'react';
import randomcolor from 'randomcolor';
import { TimelineItemEdit } from '../components/Timeline/TimelineItemEdit';
import { TrayLayout } from '../components/TrayLayout/TrayLayout';
import { TrayList } from '../components/TrayList/TrayList';
import { EventEmitter } from '../services/EventEmitter';
import { getRunningLogItem } from '../services/settings.api';
import { startNewLogItem, findFirstLogItems, stopRunningLogItem } from '../services/trackItem.api';
import { Logger } from '../logger';
import { useWindowFocused } from '../hooks/windowFocusedHook';
import { throttle } from 'lodash';
import deepEqual from 'fast-deep-equal/es6';

const EMPTY_SELECTED_ITEM = {};

const EMPTY_ARRAY = [];

export function TrayAppPage({ location }: any) {
    const [loading, setLoading] = useState(true);

    const [selectedItem, setSelectedItem] = useState(EMPTY_SELECTED_ITEM);
    const [runningLogItem, setRunningLogItem] = useState();
    const [lastLogItems, setLastLogItems] = useState(EMPTY_ARRAY);

    const { windowIsActive } = useWindowFocused();

    const loadLastLogItems = async () => {
        setLoading(true);
        try {
            const items = await findFirstLogItems();
            const areEqual = deepEqual(items, lastLogItems);

            if (!areEqual) {
                setLastLogItems(items);
            }
        } catch (e) {
            Logger.error('Error  loading first last items', e);
        }
        setLoading(false);
    };

    const loadLastLogItemsThrottled = throttle(loadLastLogItems, 4000, { trailing: false });

    useEffect(() => {
        if (windowIsActive) {
            Logger.debug('Window active:', windowIsActive);
            setSelectedItem(s => ({ ...s, color: randomcolor() }));
            loadLastLogItemsThrottled();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [windowIsActive]);

    useEffect(() => {
        const eventLogItemStarted = (_, logItem) => {
            Logger.debug('log-trackItem-started:', JSON.parse(logItem));
            setRunningLogItem(JSON.parse(logItem));
            loadLastLogItemsThrottled();
        };

        EventEmitter.on('log-item-started', eventLogItemStarted);

        return () => {
            EventEmitter.off('log-item-started', eventLogItemStarted);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        loadLastLogItemsThrottled();
        getRunningLogItem().then(logItem => {
            setRunningLogItem(logItem);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const startNewLogItemEvent = useCallback((trackItem: any, colorScope: any) => {
        startNewLogItem(trackItem);
        loadLastLogItemsThrottled();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const stopRunningLogItemEvent = useCallback(
        (trackItem: any, colorScope: any) => {
            if (runningLogItem) {
                stopRunningLogItem(runningLogItem.id);
                loadLastLogItemsThrottled();
                setRunningLogItem(null);
            } else {
                Logger.error('No running log trackItem to stop');
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [runningLogItem, setRunningLogItem],
    );

    return (
        <TrayLayout location={location}>
            {!runningLogItem && (
                <Box pt={2}>
                    <TimelineItemEdit
                        selectedTimelineItem={selectedItem}
                        colorScopeHidden
                        showPlayIcon
                        saveTimelineItem={startNewLogItem}
                    />
                </Box>
            )}
            <TrayList
                lastLogItems={lastLogItems}
                runningLogItem={runningLogItem}
                stopRunningLogItem={stopRunningLogItemEvent}
                startNewLogItem={startNewLogItemEvent}
                loading={loading}
            />
        </TrayLayout>
    );
}

TrayAppPage.whyDidYouRender = true;
