import React, { useState } from 'react';
import { VictoryContainer, VictoryPie } from 'victory';
import { colorProp } from '../charts.utils';
import { useChartThemeState } from '../../routes/ChartThemeProvider';
import { PieLabel } from '../PieCharts/PieLabel';
import { formatToTime } from '../LineCharts/LineChart.util';
import { shortTime } from '../../time.util';
import { CLOCK_MODE, getOnlineTimesForChart, getQuarters } from './OnlineChart.util';
import moment from 'moment';
import { Box, VStack, HStack, Text, Button } from '@chakra-ui/react';
import { ChartCircles } from './ChartCircles';
import { getLastOnlineTime, getOnlineTime } from '../PieCharts/MetricTiles.utils';

const QuarterLabel = props => (
    <Box width="20px" height="20px">
        <Text fontSize="xs" color="gray.400" textAlign="center" {...props} />
    </Box>
);

export const OnlineChart = ({ items }) => {
    const { chartTheme } = useChartThemeState();
    const [mode, setMode] = useState(CLOCK_MODE.HOURS_12);
    const width = 300;

    const innerWidth = 230;
    const [startDate, firstQuarter, secondQuarter, thirdQuarter, endDate] = getQuarters(
        moment(),
        mode,
    );

    const onlineTimeMs = getOnlineTime(items, [startDate, endDate]);

    const lastSessionMs = getLastOnlineTime(items, [startDate, endDate]);

    const pieData = getOnlineTimesForChart({
        beginClamp: startDate,
        endClamp: endDate,
        items,
    });

    const style: any = {
        data: {
            fill: colorProp,
            stroke: colorProp,
            strokeWidth: 0,
            fillOpacity: 0.75,
        },
    };

    return (
        <VStack>
            <Button
                position="absolute"
                alignSelf="flex-end"
                variant="ghost"
                size="xs"
                color="gray.400"
                fontWeight="bold"
                onClick={() =>
                    setMode(
                        mode === CLOCK_MODE.HOURS_24 ? CLOCK_MODE.HOURS_12 : CLOCK_MODE.HOURS_24,
                    )
                }
            >
                {CLOCK_MODE.HOURS_12 === mode ? '12h' : '24h'}
            </Button>

            <QuarterLabel>{startDate.hour()}</QuarterLabel>

            <HStack>
                <QuarterLabel>{thirdQuarter.hour()} </QuarterLabel>

                <Box>
                    <ChartCircles
                        width={width}
                        innerWidth={innerWidth}
                        onlineTimeMs={onlineTimeMs}
                        lastSessionMs={lastSessionMs}
                    />
                    <VictoryPie
                        theme={chartTheme}
                        padding={0}
                        width={width}
                        height={width}
                        innerRadius={innerWidth / 2}
                        containerComponent={<VictoryContainer responsive={false} />}
                        style={style}
                        labels={({ datum }) => {
                            const { beginDate, endDate, diff } = datum;

                            return `${shortTime(diff * 1000 * 60)}\r\n${formatToTime(
                                beginDate,
                            )}-${formatToTime(endDate)}`;
                        }}
                        labelComponent={
                            <PieLabel width={width} innerWidth={innerWidth} theme={chartTheme} />
                        }
                        y={datum => datum.diff}
                        data={pieData}
                    />
                </Box>

                <QuarterLabel>{firstQuarter.hour()}</QuarterLabel>
            </HStack>

            <QuarterLabel>{secondQuarter.hour()}</QuarterLabel>
        </VStack>
    );
};
