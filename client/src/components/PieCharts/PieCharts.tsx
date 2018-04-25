import * as React from 'react';
import { Flex, Box } from 'grid-styled';
import { PieChart } from './PieChart';
import { Heading } from './PieCharts.styles';
import { WorkProgressChart } from './WorkProgressChart';

interface IProps {
    appTrackItems: any;
    statusTrackItems: any;
    logTrackItems: any;
}

export class PieCharts extends React.Component<IProps, {}> {
    render() {
        let { appTrackItems, logTrackItems, statusTrackItems } = this.props;
        console.log('PieChars render:', appTrackItems);

        return (
            <div>
                <Flex p={1}>
                    <Box p={1} px={5}>
                        <Box>
                            <PieChart items={logTrackItems} taskName="LogTrackItem" />
                        </Box>
                        <Heading>Tasks</Heading>
                    </Box>
                    <Box p={1} px={5}>
                        <Box>
                            <PieChart items={statusTrackItems} taskName="StatusTrackItem" />
                        </Box>
                        <Heading>Status</Heading>
                    </Box>
                    <Box p={1} px={5}>
                        <Box>
                            <WorkProgressChart
                                items={statusTrackItems}
                                taskName="StatusTrackItem"
                            />
                        </Box>
                        <Heading>Progress</Heading>
                    </Box>
                    <Box p={1} px={5}>
                        <Box>
                            <PieChart items={appTrackItems} taskName="AppTrackItem" />
                        </Box>
                        <Heading>App usage</Heading>
                    </Box>
                </Flex>
            </div>
        );
    }
}
