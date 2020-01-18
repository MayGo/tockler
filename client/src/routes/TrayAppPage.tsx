import { Box } from '@rebass/grid';
import React, { useEffect } from 'react';
import randomcolor from 'randomcolor';
import { TimelineItemEdit } from '../components/Timeline/TimelineItemEdit';
import { TrayLayout } from '../components/TrayLayout/TrayLayout';
import { TrayList } from '../components/TrayList/TrayList';
import { EventEmitter } from '../services/EventEmitter';
import { getRunningLogItem } from '../services/settings.api';
import { startNewLogItem, findFirstLogItems, stopRunningLogItem } from '../services/trackItem.api';
import { Logger } from '../logger';
import { useWindowFocused } from '../hooks/windowFocusedHook';

const EMPTY_SELECTED_ITEM = {};

export function TrayAppPage({ location }: any) {
    const [loading, setLoading] = React.useState(true);

    const [selectedItem, setSelectedItem] = React.useState(EMPTY_SELECTED_ITEM);
    const [runningLogItem, setRunningLogItem] = React.useState();
    const [lastLogItems, setLastLogItems] = React.useState([]);

    const { windowIsActive } = useWindowFocused();

    useEffect(() => {
        if (windowIsActive) {
            console.debug('Window active', windowIsActive);
            setSelectedItem(s => ({ ...s, color: randomcolor() }));
            loadLastLogItems();
        }
    }, [windowIsActive]);

    const loadLastLogItems = async () => {
        setLoading(true);
        try {
            const items = await findFirstLogItems();
            setLastLogItems(items);
        } catch (e) {
            console.error('Error  loading first last items', e);
        }
        setLoading(false);
    };

    React.useEffect(() => {
        const eventLogItemStarted = (_, logItem) => {
            Logger.debug('log-trackItem-started:', JSON.parse(logItem));
            setRunningLogItem(JSON.parse(logItem));
            loadLastLogItems();
        };

        EventEmitter.on('log-item-started', eventLogItemStarted);

        return () => {
            EventEmitter.off('log-item-started', eventLogItemStarted);
        };
    }, []);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    React.useEffect(() => {
        loadLastLogItems();
        getRunningLogItem().then(logItem => {
            setRunningLogItem(logItem);
        });
    }, []);

    const startNewLogItemEvent = (trackItem: any, colorScope: any) => {
        startNewLogItem(trackItem);
        loadLastLogItems();
    };

    const stopRunningLogItemEvent = (trackItem: any, colorScope: any) => {
        if (runningLogItem) {
            stopRunningLogItem(runningLogItem.id);
            loadLastLogItems();
            setRunningLogItem(null);
        } else {
            Logger.error('No running log trackItem to stop');
        }
    };

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
