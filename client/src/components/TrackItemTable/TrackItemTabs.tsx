import { Box, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import { useRef } from 'react';
import { TrackItemType } from '../../enum/TrackItemType';
import { TrackItemTable } from './TrackItemTable';

export const TrackItemTabs = () => {
    const resetButtonsRef = useRef(null);

    return (
        <Tabs variant="enclosed" isLazy>
            <TabList mb={0}>
                <Tab borderBottomWidth={0}>Apps</Tab>
                <Tab borderBottomWidth={0}>Logs</Tab>
                <Box flex={1} />
                <Box ref={resetButtonsRef} />
            </TabList>
            <TabPanels>
                <TabPanel p={0}>
                    <TrackItemTable type={TrackItemType.AppTrackItem} resetButtonsRef={resetButtonsRef} />
                </TabPanel>
                <TabPanel p={0}>
                    <TrackItemTable type={TrackItemType.LogTrackItem} resetButtonsRef={resetButtonsRef} />
                </TabPanel>
            </TabPanels>
        </Tabs>
    );
};
