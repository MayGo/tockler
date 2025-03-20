import { Box, Divider } from '@chakra-ui/react';
import { memo, useEffect } from 'react';
import { ITrackItem } from '../@types/ITrackItem';
import { LoadingLine } from '../components/LoadingLine';
import { OnlineChart } from '../components/TrayLayout/OnlineChart';
import { AggregatedTrackItem, TrayList } from '../components/TrayList/TrayList';
import { useTrayData } from '../hooks/useTrayData';
import { useWindowFocused } from '../hooks/windowFocusedHook';
import { Logger } from '../logger';
import { startNewLogItem, stopRunningLogItem } from '../services/trackItem.api';
import { sendOpenTrayEvent } from '../useGoogleAnalytics.utils';
import { TrayItemEdit } from './tray/TrayItemEdit';

const EMPTY_ARRAY = [];

const TrayAppPageTemp = () => {
    const { isLoading, statusItems, logItems, refreshData, runningLogItem, setRunningLogItem } = useTrayData();
    const { windowIsActive } = useWindowFocused();

    // Refresh data when window becomes active
    useEffect(() => {
        if (windowIsActive) {
            Logger.debug('Window active, refreshing data');
            refreshData();
            sendOpenTrayEvent();
        }
        // Intentionally omitting refreshData from dependencies as it would cause a refresh loop
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [windowIsActive]);

    function startNewLogItemEvent(trackItem: ITrackItem) {
        startNewLogItem(trackItem);
        refreshData();
    }

    function stopRunningLogItemEvent() {
        if (runningLogItem) {
            setRunningLogItem(undefined);
            stopRunningLogItem(runningLogItem.id);
        } else {
            Logger.error('No running log trackItem to stop');
        }
    }

    return (
        <>
            <Box position="relative" overflow="hidden" width="100%" height="2px">
                {isLoading && <LoadingLine />}
            </Box>

            <Box p={4}>
                <TrayItemEdit
                    saveTimelineItem={(trackItem: ITrackItem) => {
                        startNewLogItem(trackItem);
                        refreshData();
                    }}
                />
            </Box>
            <Box px={4} pb={4}>
                <OnlineChart items={statusItems || EMPTY_ARRAY} />
            </Box>
            <Divider borderColor="gray.200" />
            <TrayList
                lastLogItems={logItems as AggregatedTrackItem[]}
                runningLogItem={runningLogItem}
                stopRunningLogItem={stopRunningLogItemEvent}
                startNewLogItem={startNewLogItemEvent}
            />
        </>
    );
};

export const TrayAppPage = memo(TrayAppPageTemp);
