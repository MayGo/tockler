import * as React from 'react';
import { Flex, Box } from 'grid-styled';
import { PieChart } from './PieChart';

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
                    <Box pr={1}>
                        <PieChart items={logTrackItems} taskName="LogTrackItem" />
                    </Box>
                    <Box pr={1}>
                        <PieChart items={statusTrackItems} taskName="StatusTrackItem" />
                    </Box>
                    <Box pr={1}>
                        <PieChart items={appTrackItems} taskName="AppTrackItem" />
                    </Box>
                </Flex>
            </div>
        );
    }
}
