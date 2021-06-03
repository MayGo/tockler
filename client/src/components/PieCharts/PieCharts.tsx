import { Box, Flex } from 'reflexbox';
import { useWindowWidth } from '@react-hook/window-size/throttled';
import React, { memo, useContext } from 'react';
import { RootContext } from '../../RootContext';
import { filterItems } from '../Timeline/timeline.utils';
import { PieChart } from './PieChart';
import { Heading } from './PieCharts.styles';
import { WorkProgressChart } from './WorkProgressChart';
import { useStoreState } from '../../store/easyPeasy';

export const PieCharts = memo(() => {
    const timeItems = useStoreState(state => state.timeItems);
    const visibleTimerange = useStoreState(state => state.visibleTimerange);

    const { workSettings } = useContext(RootContext);
    const innerWidth = useWindowWidth();

    const appItems = filterItems(timeItems.appItems, visibleTimerange);
    const statusItems = filterItems(timeItems.statusItems, visibleTimerange);

    const pieWidth = Math.min(innerWidth / 3, 200);

    return (
        <div>
            <Flex style={{ justifyContent: 'center' }}>
                <Box>
                    <Box>
                        <PieChart items={statusItems} taskName="StatusTrackItem" width={pieWidth} />
                    </Box>
                    <Heading>Status</Heading>
                </Box>
                <Box>
                    <Box>
                        <WorkProgressChart
                            hoursToWork={workSettings.hoursToWork}
                            items={statusItems}
                            width={pieWidth}
                        />
                    </Box>
                    <Heading>Progress for {workSettings.hoursToWork}h</Heading>
                </Box>
                <Box>
                    <Box>
                        <PieChart items={appItems} taskName="AppTrackItem" width={pieWidth} />
                    </Box>
                    <Heading>App usage</Heading>
                </Box>
            </Flex>
        </div>
    );
});
