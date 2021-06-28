import React, { useState } from 'react';
import { VictoryContainer, VictoryPie } from 'victory';
import { colorProp } from '../charts.utils';
import { useChartThemeState } from '../../routes/ChartThemeProvider';
import { PieLabel } from '../PieCharts/PieLabel';
import { formatToTime } from '../LineCharts/LineChart.util';
import { shortTime } from '../../time.util';
import { CLOCK_MODE, getOnlineTimesForChart, getQuarters } from './OnlineChart.util';
import moment from 'moment';
import { Box, VStack, HStack, Flex, Text, Button } from '@chakra-ui/react';

const QuarterLabel = props => (
    <Box width="20px" height="20px">
        <Text fontSize="xs" color="gray.600" textAlign="center" {...props} />
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
                alignSelf="flex-end"
                variant="ghost"
                size="xs"
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
                    <Flex
                        position="absolute"
                        alignItems="center"
                        justifyContent="center"
                        textAlign="center"
                        w={width}
                        h={width}
                        pointerEvents="none"
                    >
                        <Box
                            w={width}
                            h={width}
                            borderRadius="full"
                            position="absolute"
                            top={0}
                            left={0}
                            bottom={0}
                            right={0}
                            margin="auto"
                            borderColor="black"
                            borderWidth={1}
                            zIndex={1}
                        />
                        <Box
                            bg="gray.800"
                            w={width}
                            h={width}
                            borderRadius="full"
                            position="absolute"
                            top={0}
                            left={0}
                            bottom={0}
                            right={0}
                            margin="auto"
                            boxShadow="0 0 0 4px rgba(107,114,128,0.50), inset 0 0 18px 4px rgba(0,0,0,0.50)"
                        />

                        <Flex
                            bg="gray.900"
                            w={innerWidth}
                            h={innerWidth}
                            borderRadius="full"
                            position="absolute"
                            top={0}
                            left={0}
                            bottom={0}
                            right={0}
                            margin="auto"
                            boxShadow="0 0 1px 1px #111827, inset 0 0 0 5px rgba(107,114,128,0.50)"
                            borderColor="black"
                            borderWidth={1}
                            zIndex={1}
                            justifyContent="center"
                            flexDirection="column"
                        >
                            <Text fontSize="md" color="gray.300" mt={5}>
                                Online Today
                            </Text>
                            <Text fontSize="4xl" color="gray.100">
                                3h 30m
                            </Text>
                            <Text fontSize="md" color="gray.300" pt={1}>
                                Last Session
                            </Text>
                            <Text fontSize="2xl" color="gray.300">
                                39m
                            </Text>
                        </Flex>
                    </Flex>
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
/*
   <svg viewBox="0 0 450 350">
            {items.map(item => (
                <Arc
                    cx={100}
                    cy={100}
                    r={10}
                    startAngle={dateToMinutes(true)(item) * max}
                    endAngle={dateToMinutes(false)(item) * max}
                />
            ))}
        </svg>
*/
