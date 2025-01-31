// tslint:disable-next-line: no-submodule-imports

import { useRef } from 'react';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import { TrackItemTable } from './TrackItemTable';
import { TrackItemType } from '../../enum/TrackItemType';
import { Box } from '@chakra-ui/react';

export const TrackItemTabs = () => {
    const tableResetRef = useRef(null);

    return (
        <Tabs variant="enclosed" isLazy>
            <TabList mb={0}>
                <Tab borderBottomWidth={0}>Apps</Tab>
                <Tab borderBottomWidth={0}>Logs</Tab>
                <Box flex={1} />
                <Box ref={tableResetRef} />
            </TabList>
            <TabPanels>
                <TabPanel p={0}>
                    <TrackItemTable type={TrackItemType.AppTrackItem} resetButtonsRef={tableResetRef} />
                </TabPanel>
                <TabPanel p={0}>
                    <TrackItemTable type={TrackItemType.LogTrackItem} resetButtonsRef={tableResetRef} />
                </TabPanel>
            </TabPanels>
        </Tabs>
    );
};
