import { Box, Flex, Stack, Text, useColorModeValue, VStack } from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { CardBox } from '../components/CardBox';
import { MainLayout } from '../components/MainLayout/MainLayout';
import { AppUsageChart } from '../components/PieCharts/AppUsageChart';
import { MetricTiles } from '../components/PieCharts/MetricTiles';
import { TaskList } from '../components/TaskList';
import { NewLogButton } from '../components/Timeline/NewLogButton';
import { Search } from '../components/Timeline/Search';
import { Timeline } from '../components/Timeline/Timeline';
import { VisibleRange } from '../components/Timeline/VisibleRange';
import { TrackItemTabs } from '../components/TrackItemTable/TrackItemTabs';
import { useInterval } from '../hooks/intervalHook';
import { useStoreActions, useStoreState } from '../store/easyPeasy';
import { PaywallOverlay } from '../components/Paywall/PaywallOverlay';
import moment from 'moment';

const BG_SYNC_DELAY_MS = 10000;
const TIMELINE_TRIAL_DAYS = 30;

const ItemLabel = props => <Text fontSize="md" color={useColorModeValue('gray.700', 'gray.300')} {...props} />;

export function TimelinePage() {
    const timerange = useStoreState(state => state.timerange);
    const [beginDate] = timerange;
    const fetchTimerange = useStoreActions(actions => actions.fetchTimerange);
    const bgSyncInterval = useStoreActions(actions => actions.bgSyncInterval);

    useInterval(() => {
        bgSyncInterval();
    }, [BG_SYNC_DELAY_MS]);

    useEffect(() => {
        fetchTimerange();
    }, [fetchTimerange]);

    const now = moment();
    const showPaywall = now.diff(beginDate, 'days') > TIMELINE_TRIAL_DAYS;

    return (
        <MainLayout>
            {showPaywall && <PaywallOverlay top={130} />}
            <VStack p={4} spacing={4}>
                <CardBox>
                    <Flex>
                        <Search />
                        <Box flex={1} />
                        <Box py={1}>
                            <NewLogButton />
                        </Box>
                    </Flex>
                    <Flex>
                        <Stack py={4} my={4} pr={4} pl={1}>
                            <ItemLabel>Task</ItemLabel>
                            <ItemLabel>Status</ItemLabel>
                            <ItemLabel>App</ItemLabel>
                        </Stack>
                        <Timeline />
                    </Flex>
                    <Flex alignItems="flex-end">
                        <MetricTiles />
                        <VisibleRange />
                    </Flex>
                </CardBox>

                <CardBox title="App Usage">
                    <AppUsageChart />
                </CardBox>
                <CardBox title="Tasks">
                    <TaskList />
                </CardBox>
                <CardBox>
                    <TrackItemTabs />
                </CardBox>
            </VStack>
        </MainLayout>
    );
}
