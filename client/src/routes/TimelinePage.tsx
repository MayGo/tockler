import { Box, Flex, Stack, Text, VStack } from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { CardBox } from '../components/CardBox';
import { MainLayout } from '../components/MainLayout/MainLayout';
import { AppUsageChart } from '../components/PieCharts/AppUsageChart';

import { MetricTiles } from '../components/PieCharts/MetricTiles';
import { NewLogButton } from '../components/Timeline/NewLogButton';
import { Search } from '../components/Timeline/Search';
import { Timeline } from '../components/Timeline/Timeline';
import { VisibleRange } from '../components/Timeline/VisibleRange';
import { TrackItemTabs } from '../components/TrackItemTable/TrackItemTabs';
import { useInterval } from '../hooks/intervalHook';
import { useStoreActions } from '../store/easyPeasy';

const BG_SYNC_DELAY_MS = 10000;

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
            <VStack p={4} spacing={4}>
                <CardBox>
                    <Flex>
                        <Search />
                        <Box flex={1} />
                        <NewLogButton />
                    </Flex>
                    <Flex>
                        <Stack py={4} my={4} pr={4} pl={1}>
                            <Text fontSize="md" color="gray.300">
                                Task
                            </Text>
                            <Text fontSize="md" color="gray.300">
                                Status
                            </Text>
                            <Text fontSize="md" color="gray.300">
                                App
                            </Text>
                        </Stack>
                        <Timeline />
                    </Flex>
                    <Flex>
                        <MetricTiles />
                        <VisibleRange />
                    </Flex>
                </CardBox>
                <CardBox title="App Usage">
                    <AppUsageChart />
                </CardBox>
                <CardBox>
                    <TrackItemTabs />
                </CardBox>
            </VStack>
        </MainLayout>
    );
}
