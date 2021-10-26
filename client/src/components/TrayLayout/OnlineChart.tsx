import React, { useState, useEffect } from 'react';
import { VictoryContainer, VictoryPie } from 'victory';
import { colorProp } from '../charts.utils';
import { useChartThemeState } from '../../routes/ChartThemeProvider';
import { PieLabel } from '../PieCharts/PieLabel';
import { formatToTime } from '../LineCharts/LineChart.util';
import { shortTime } from '../../time.util';
import { CLOCK_MODE, getOnlineTimesForChart, getQuarters, getTotalOnlineDuration } from './OnlineChart.util';
import moment from 'moment';
import { Box, VStack, HStack, Text, Button, useColorModeValue } from '@chakra-ui/react';
import { ChartCircles } from './ChartCircles';
import { getLastOnlineTime, getOnlineTime } from '../PieCharts/MetricTiles.utils';
import { ShortTimeInterval } from '../TrayList/ShortTimeInterval';

const QuarterLabel = (props) => (
    <Box width="20px" height="20px">
        <Text fontSize="xs" color="gray.400" textAlign="center" {...props} />
    </Box>
);

const MINUTES = 60 * 1000;

export const OnlineChart = ({ items }) => {
    const { chartTheme } = useChartThemeState();
    const [mode, setMode] = useState(CLOCK_MODE.HOURS_12);

    const [onlineSince, setOnlineSince] = useState<any>(getTotalOnlineDuration(moment(), items));
    const onlineSinceColor = useColorModeValue('var(--chakra-colors-blue-700)', 'var(--chakra-colors-blue-300)');

    useEffect(() => {
        setOnlineSince(getTotalOnlineDuration(moment(), items));
    }, [items]);

    const width = 300;

    const innerWidth = 230;
    const [startDate, firstQuarter, secondQuarter, thirdQuarter, endDate] = getQuarters(moment(), mode);

    const onlineTimeMs = getOnlineTime(items, [startDate, endDate]);

    const lastSessionMs = getLastOnlineTime(items, [startDate, endDate]);

    const pieData = getOnlineTimesForChart({
        beginClamp: startDate,
        endClamp: endDate,
        items,
        mode,
    });

    const style: any = {
        data: {
            fill: colorProp,
            stroke: colorProp,
            strokeWidth: 0,
            fillOpacity: 0.75,
        },
    };

    const MAX_TIMER = 60 * MINUTES;

    return (
        <VStack position="relative">
            <QuarterLabel>{startDate.hour()}</QuarterLabel>

            <HStack>
                <QuarterLabel>{thirdQuarter.hour()} </QuarterLabel>

                <Box>
                    <ChartCircles
                        width={width}
                        innerWidth={innerWidth}
                        onlineTimeMs={<ShortTimeInterval totalMs={onlineTimeMs} />}
                        lastSessionMs={lastSessionMs}
                        onlineSince={<ShortTimeInterval totalMs={onlineSince} />}
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

                            return `${shortTime(diff * 1000 * 60)}\r\n${formatToTime(beginDate)} - ${formatToTime(
                                endDate,
                            )}`;
                        }}
                        labelComponent={<PieLabel width={width} innerWidth={innerWidth - 10} theme={chartTheme} />}
                        y={(datum) => datum.diff}
                        data={pieData}
                    />
                    <Box
                        position="absolute"
                        top={0}
                        mt={'63px'}
                        left="50%"
                        ml={`${-((width - 70) / 2)}px`}
                        opacity="0.9"
                        zIndex={10}
                    >
                        <VictoryPie
                            theme={chartTheme}
                            padding={2}
                            width={width - 69}
                            height={width - 69}
                            innerRadius={innerWidth / 2 - 5}
                            containerComponent={<VictoryContainer responsive={false} />}
                            style={style}
                            y={(datum) => datum.diff}
                            labels={() => null}
                            data={[
                                { x: 1, diff: MAX_TIMER - onlineSince - 0.3 * MINUTES, color: 'transparent' },
                                { x: 2, diff: 0.3 * MINUTES, color: 'white' },
                                { x: 3, diff: onlineSince, color: onlineSinceColor },
                            ]}
                        />
                    </Box>
                </Box>

                <QuarterLabel>{firstQuarter.hour()}</QuarterLabel>
            </HStack>

            <QuarterLabel>{secondQuarter.hour()}</QuarterLabel>
            <Button
                position="absolute"
                alignSelf="flex-end"
                variant="ghost"
                size="xs"
                color="gray.400"
                fontWeight="bold"
                onClick={() => setMode(mode === CLOCK_MODE.HOURS_24 ? CLOCK_MODE.HOURS_12 : CLOCK_MODE.HOURS_24)}
            >
                {CLOCK_MODE.HOURS_12 === mode ? '12h' : '24h'}
            </Button>
        </VStack>
    );
};
