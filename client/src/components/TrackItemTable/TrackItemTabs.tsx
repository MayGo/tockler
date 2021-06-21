// tslint:disable-next-line: no-submodule-imports

import React, { useRef } from 'react';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/tabs';
import { TrackItemTable } from './TrackItemTable';
import { TrackItemType } from '../../enum/TrackItemType';
import { Box } from '@chakra-ui/react';

export const TrackItemTabs = () => {
    const tableResetRef = useRef();

    return (
        <Tabs variant="enclosed" isLazy>
            <TabList>
                <Tab>Apps</Tab>
                <Tab>Logs</Tab>
                <Box flex={1} />
                <Box ref={tableResetRef} />
            </TabList>
            <TabPanels>
                <TabPanel>
                    <TrackItemTable
                        type={TrackItemType.AppTrackItem}
                        resetButtonsRef={tableResetRef}
                    />
                </TabPanel>
                <TabPanel>
                    <TrackItemTable
                        type={TrackItemType.LogTrackItem}
                        resetButtonsRef={tableResetRef}
                    />
                </TabPanel>
            </TabPanels>
        </Tabs>
    );
};
