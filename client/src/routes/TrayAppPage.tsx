import { Box } from '@rebass/grid';
import React, { useEffect } from 'react';
import randomcolor from 'randomcolor';
import { TimelineItemEdit } from '../components/Timeline/TimelineItemEdit';
import { TrayLayout } from '../components/TrayLayout/TrayLayout';
import { TrayList } from '../components/TrayList/TrayList';
import { EventEmitter } from '../services/EventEmitter';
import { getRunningLogItem } from '../services/settings.api';
import { TrackItemService } from '../services/TrackItemService';
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
        console.debug('Window active', windowIsActive);
        setSelectedItem({ ...selectedItem, color: randomcolor() });
    }, [windowIsActive]);

    const loadLastLogItems = () => {
        setLoading(true);
        TrackItemService.findFirstLogItems().then(items => {
            setLastLogItems(items);
            setLoading(false);
        });
    };

    React.useEffect(() => {
        const eventLogItemStarted = (_, logItem) => {
            Logger.debug('log-item-started:', JSON.parse(logItem));
            setRunningLogItem(JSON.parse(logItem));
            loadLastLogItems();
        };
        EventEmitter.on('log-item-started', eventLogItemStarted);

        return () => {
            EventEmitter.off('log-item-started', eventLogItemStarted);
        };
    }, []);

    React.useEffect(() => {
        loadLastLogItems();
        getRunningLogItem().then(logItem => {
            setRunningLogItem(logItem);
        });
    }, []);

    const startNewLogItem = (item: any, colorScope: any) => {
        TrackItemService.startNewLogItem(item);
        loadLastLogItems();
    };

    const stopRunningLogItem = (item: any, colorScope: any) => {
        if (runningLogItem) {
            TrackItemService.stopRunningLogItem(runningLogItem.id);
            loadLastLogItems();
            setRunningLogItem(null);
        } else {
            Logger.error('No running log item to stop');
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
                stopRunningLogItem={stopRunningLogItem}
                startNewLogItem={startNewLogItem}
                loading={loading}
            />
        </TrayLayout>
    );
}
