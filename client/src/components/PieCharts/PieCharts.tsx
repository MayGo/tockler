import { Box, Flex } from '@rebass/grid';
import { useWindowWidth } from '@react-hook/window-size/throttled';
import React, { memo, useContext } from 'react';
import { RootContext } from '../../RootContext';
import { filterItems } from '../Timeline/timeline.utils';
import { PieChart } from './PieChart';
import { Heading } from './PieCharts.styles';
import { WorkProgressChart } from './WorkProgressChart';

interface IProps {
    timeItems: any;
    visibleTimerange: any;
}

export const PieCharts = memo<IProps>(({ timeItems, visibleTimerange }) => {
    const { workSettings } = useContext(RootContext);
    const innerWidth = useWindowWidth();

    const appItems = filterItems(timeItems.appItems, visibleTimerange);
    const statusItems = filterItems(timeItems.statusItems, visibleTimerange);
    const logItems = filterItems(timeItems.logItems, visibleTimerange);

    const pieWidth = innerWidth / 4;

    return (
        <div>
            <Flex>
                <Box>
                    <Box>
                        <PieChart items={logItems} taskName="LogTrackItem" width={pieWidth} />
                    </Box>
                    <Heading>Tasks</Heading>
                </Box>
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
