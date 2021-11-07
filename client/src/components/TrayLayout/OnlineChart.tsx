import React, { useState, useEffect, useContext } from 'react';
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
import { getOnlineTime } from '../PieCharts/MetricTiles.utils';
import { ShortTimeInterval } from '../TrayList/ShortTimeInterval';
import { RootContext } from '../../RootContext';
import { notifyUser } from '../../services/settings.api';

const QuarterLabel = (props) => (
    <Box width="20px" height="20px">
        <Text fontSize="xs" color="gray.400" textAlign="center" {...props} />
    </Box>
);

const MINUTES = 60 * 1000;

export const OnlineChart = ({ items }) => {
    const { workSettings } = useContext(RootContext);

    const { chartTheme } = useChartThemeState();
    const [mode, setMode] = useState(CLOCK_MODE.HOURS_12);

    const [currentSession, setCurrentSession] = useState<any | undefined>();
    const [userHasBeenNotified, setUserHasBeenNotified] = useState(false);
    const [lastSession, setLastSession] = useState<any | undefined>();
    const onlineSinceColor = useColorModeValue('var(--chakra-colors-blue-500)', 'var(--chakra-colors-blue-500)');
    const overtimeColor = 'var(--chakra-colors-red-500)';

    const sessionLength = workSettings.sessionLength;
    const MAX_TIMER = sessionLength * MINUTES;
    const sessionIsOvertime = currentSession > MAX_TIMER;
    const minBreakTime = 5;

    useEffect(() => {
        if (sessionIsOvertime) {
            if (!userHasBeenNotified) {
                console.warn('Notifying user to take a break');
                notifyUser(currentSession);
                setUserHasBeenNotified(true);
            }
        } else {
            setUserHasBeenNotified(false);
        }
    }, [sessionIsOvertime, currentSession, userHasBeenNotified]);

    useEffect(() => {
        const grouped = getTotalOnlineDuration(moment(), items, minBreakTime);
        const sessionTime = grouped[0];
        setCurrentSession(sessionTime);

        if (sessionIsOvertime) {
            if (!userHasBeenNotified) {
                console.warn('Notifying user to take a break');
                notifyUser(sessionTime);
                setUserHasBeenNotified(true);
            }
        } else {
            setUserHasBeenNotified(false);
        }

        if (grouped.length > 1) {
            setLastSession(grouped[1]);
        } else {
            setLastSession(undefined);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items]);

    const width = 300;

    const innerWidth = 230;
    const [startDate, firstQuarter, secondQuarter, thirdQuarter, endDate] = getQuarters(moment(), mode);

    const onlineTimeMs = getOnlineTime(items, [startDate, endDate]);

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

    const sessionLineHighlight = 0.3 * MINUTES;
    const sessionLine = MAX_TIMER - currentSession; // - sessionLineHighlight;

    console.info('MAX_TIMER - currentSession - 0.3 * MINUTES', {
        sessionLength,
        MAX_TIMER,
        currentSession,
        sessionLineHighlight,
        sessionLine,
    });

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
                    <Box position="absolute" top={0} mt={'63px'} left="50%" ml={`${-((width - 70) / 2)}px`} zIndex={10}>
                        <VictoryPie
                            theme={chartTheme}
                            padding={2}
                            width={width - 70}
                            height={width - 70}
                            innerRadius={innerWidth / 2 - 5}
                            containerComponent={<VictoryContainer responsive={false} />}
                            style={style}
                            y={(datum) => datum.diff}
                            labels={() => null}
                            data={[
                                { x: 1, diff: sessionLine, color: 'transparent' },
                                // { x: 2, diff: sessionLineHighlight, color: onlineSinceLineColor },
                                {
                                    x: 3,
                                    diff: currentSession,
                                    color: sessionIsOvertime ? overtimeColor : onlineSinceColor,
                                },
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
