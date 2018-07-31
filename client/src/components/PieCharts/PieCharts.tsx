import * as React from 'react';
import { Flex, Box } from 'grid-styled';
import { PieChart } from './PieChart';
import { Heading } from './PieCharts.styles';
import { WorkProgressChart } from './WorkProgressChart';

interface IProps {
    appTrackItems: any;
    statusTrackItems: any;
    logTrackItems: any;
    workSettings: any;
    screenWidth: number;
}

export class PieCharts extends React.Component<IProps, {}> {
    render() {
        let {
            appTrackItems,
            logTrackItems,
            statusTrackItems,
            screenWidth,
            workSettings,
        } = this.props;

        const pieWidth = screenWidth / 4;

        return (
            <div>
                <Flex>
                    <Box>
                        <Box>
                            <PieChart
                                items={logTrackItems}
                                taskName="LogTrackItem"
                                width={pieWidth}
                            />
                        </Box>
                        <Heading>Tasks</Heading>
                    </Box>
                    <Box>
                        <Box>
                            <PieChart
                                items={statusTrackItems}
                                taskName="StatusTrackItem"
                                width={pieWidth}
                            />
                        </Box>
                        <Heading>Status</Heading>
                    </Box>
                    <Box>
                        <Box>
                            <WorkProgressChart
                                hoursToWork={workSettings.hoursToWork}
                                items={statusTrackItems}
                                taskName="StatusTrackItem"
                                width={pieWidth}
                            />
                        </Box>
                        <Heading>Progress for {workSettings.hoursToWork}h</Heading>
                    </Box>
                    <Box>
                        <Box>
                            <PieChart
                                items={appTrackItems}
                                taskName="AppTrackItem"
                                width={pieWidth}
                            />
                        </Box>
                        <Heading>App usage</Heading>
                    </Box>
                </Flex>
            </div>
        );
    }
}
