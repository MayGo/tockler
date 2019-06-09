import { Box } from '@rebass/grid';
import * as React from 'react';

import { TimelineItemEdit } from '../components/Timeline/TimelineItemEdit';
import { TrayLayout } from '../components/TrayLayout/TrayLayout';
import { TrayList } from '../components/TrayList/TrayList';
import { EventEmitter } from '../services/EventEmitter';
import { SettingsService } from '../services/SettingsService';
import { TrackItemService } from '../services/TrackItemService';

const EMPTY_SELECTED_ITEM = {};

export function TrayAppPage({ location }: any) {
    const [loading, setLoading] = React.useState(true);
    const [runningLogItem, setRunningLogItem] = React.useState();
    const [lastLogItems, setLastLogItems] = React.useState([]);

    const loadLastLogItems = () => {
        setLoading(true);
        TrackItemService.findFirstLogItems().then(items => {
            setLastLogItems(items);
            setLoading(false);
        });
    };

    React.useEffect(() => {
        const eventLogItemStarted = (_, logItem) => {
            console.log('log-item-started:', JSON.parse(logItem));
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
        SettingsService.getRunningLogItem().then(logItem => {
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
            console.error('No running log item to stop');
        }
    };

    return (
        <TrayLayout location={location}>
            {!runningLogItem && (
                <Box pt={2}>
                    <TimelineItemEdit
                        selectedTimelineItem={EMPTY_SELECTED_ITEM}
                        colorScopeHidden={true}
                        showPlayIcon={true}
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
