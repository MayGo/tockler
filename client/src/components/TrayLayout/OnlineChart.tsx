import { Box, Button, HStack, Text, useColorModeValue, VStack } from '@chakra-ui/react';
import { DateTime } from 'luxon';
import { useContext, useEffect, useState } from 'react';
import { VictoryContainer, VictoryPie, VictoryStyleInterface } from 'victory';
import { ITrackItem } from '../../@types/ITrackItem';
import { RootContext } from '../../RootContext';
import { useChartThemeState } from '../../routes/ChartThemeProvider';
import { colorProp } from '../charts.utils';
import { getOnlineTime } from '../PieCharts/MetricTiles.utils';
import { ShortTimeInterval } from '../TrayList/ShortTimeInterval';
import { ChartCircles } from './ChartCircles';
import { CLOCK_MODE, getOnlineTimesForChart, getQuarters, getTotalOnlineDuration } from './OnlineChart.util';
import { OnlineChartTooltipLabel } from './OnlineChartTooltipLabel';

const QuarterLabel = (props) => (
    <Box width="20px" height="20px">
        <Text fontSize="xs" color="gray.400" textAlign="center" {...props} />
    </Box>
);

const MINUTES = 60 * 1000;

export const OnlineChart = ({ items }: { items: ITrackItem[] }) => {
    const { workSettings } = useContext(RootContext);
    const { chartTheme } = useChartThemeState();
    const [mode, setMode] = useState(CLOCK_MODE.HOURS_12);
    const [currentSession, setCurrentSession] = useState<number>(0);
    const [lastSession, setLastSession] = useState<number | undefined>();
    const onlineSinceColor = useColorModeValue('var(--chakra-colors-blue-500)', 'var(--chakra-colors-blue-500)');
    const overtimeColor = 'var(--chakra-colors-red-500)';

    const { sessionLength, minBreakTime } = workSettings;

    const MAX_TIMER = sessionLength * MINUTES;
    const sessionIsOvertime = currentSession > MAX_TIMER;

    useEffect(() => {
        const grouped = getTotalOnlineDuration(DateTime.now(), items, minBreakTime);
        const sessionTime = grouped[0];
        setCurrentSession(sessionTime);

        if (grouped.length > 1) {
            setLastSession(grouped[1]);
        } else {
            setLastSession(undefined);
        }
    }, [items, minBreakTime]);

    const width = 300;

    const innerWidth = 230;
    const [startDate, firstQuarter, secondQuarter, thirdQuarter, endDate] = getQuarters(DateTime.now(), mode);

    const onlineTimeMs = getOnlineTime(items, [startDate, endDate]);

    const pieData = getOnlineTimesForChart({
        beginClamp: startDate,
        endClamp: endDate,
        items,
        mode,
    });

    const style: VictoryStyleInterface = {
        data: {
            fill: colorProp,
            stroke: colorProp,
            strokeWidth: 0,
            fillOpacity: 0.75,
        },
    };

    const sessionLine = MAX_TIMER - currentSession;

    return (
        <VStack position="relative">
            <QuarterLabel>{startDate.hour}</QuarterLabel>

            <HStack>
                <QuarterLabel>{thirdQuarter.hour}</QuarterLabel>

                <Box>
                    <ChartCircles
                        width={width}
                        innerWidth={innerWidth}
                        onlineTimeMs={<ShortTimeInterval totalMs={onlineTimeMs} />}
                        lastSessionMs={lastSession}
                        currentSession={<ShortTimeInterval totalMs={currentSession} />}
                    />
                    <VictoryPie
                        theme={chartTheme}
                        padding={0}
                        width={width}
                        height={width}
                        innerRadius={innerWidth / 2}
                        containerComponent={<VictoryContainer responsive={false} />}
                        style={style}
                        labelComponent={
                            <OnlineChartTooltipLabel width={width} innerWidth={innerWidth - 10} theme={chartTheme} />
                        }
                        y={(datum) => datum.diff}
                        data={pieData}
                    />
                    <Box
                        position="absolute"
                        top={0}
                        mt={'63px'}
                        left="50%"
                        ml={`${-((width - 70) / 2)}px`}
                        zIndex={10}
                        pointerEvents="none"
                    >
                        <svg style={{ pointerEvents: 'none' }} width={width - 70} height={width - 70}>
                            <VictoryPie
                                theme={chartTheme}
                                padding={2}
                                width={width - 70}
                                height={width - 70}
                                standalone={false}
                                innerRadius={innerWidth / 2 - 5}
                                containerComponent={
                                    <VictoryContainer responsive={false} style={{ pointerEvents: 'none' }} />
                                }
                                style={style}
                                y={(datum) => datum.diff}
                                labels={() => null}
                                data={[
                                    { x: 1, diff: sessionLine, color: 'transparent' },
                                    {
                                        x: 3,
                                        diff: currentSession,
                                        color: sessionIsOvertime ? overtimeColor : onlineSinceColor,
                                    },
                                ]}
                            />
                        </svg>
                    </Box>
                </Box>

                <QuarterLabel>{firstQuarter.hour}</QuarterLabel>
            </HStack>

            <QuarterLabel>{secondQuarter.hour}</QuarterLabel>
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
