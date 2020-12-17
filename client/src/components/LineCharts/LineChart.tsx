import React, { useContext } from 'react';
import moment from 'moment';
import { values } from 'lodash';
import { VictoryBar, VictoryChart, VictoryAxis, VictoryTooltip } from 'victory';
import { convertDate, TIME_FORMAT, DAY_MONTH_LONG_FORMAT, COLORS } from '../../constants';

import { useWindowWidth } from '@react-hook/window-size/throttled';
import { SummaryContext } from '../../SummaryContext';
import {
    addToTimeDuration,
    formatToTimeEveryOther,
    formatToDay,
    toTimeDuration,
} from './LineChart.util';
import { diffAndFormatShort } from '../../utils';
import { useChartThemeState } from '../../routes/ChartThemeProvider';

const scale: any = { x: 'time', y: 'time' };
const padding: any = { left: 50, top: 20, bottom: 20, right: 10 };
const domainPadding: any = { y: 40, x: [20, 40] };

const labelComponent = theme => (
    <VictoryTooltip
        style={theme.tooltip.style}
        cornerRadius={theme.tooltip.cornerRadius}
        pointerLength={theme.tooltip.pointerLength}
        flyoutStyle={theme.tooltip.flyoutStyle}
        renderInPortal
        horizontal={false}
    />
);

export const LineChart = () => {
    const { chartTheme } = useChartThemeState();
    const chartWidth = useWindowWidth();
    const { onlineTimesSummary, selectedDate } = useContext(SummaryContext);

    const onlineTimesValues = values(onlineTimesSummary);

    const barHeight = 20;

    const daysInMonth = selectedDate.daysInMonth();
    const daysArray = Array.from(Array(daysInMonth), (_, i) => i + 1);

    return (
        <VictoryChart
            theme={chartTheme}
            scale={scale}
            width={chartWidth}
            height={800}
            domainPadding={domainPadding}
            padding={padding}
            horizontal
        >
            <VictoryAxis orientation="top" tickFormat={formatToTimeEveryOther} dependentAxis />
            <VictoryAxis orientation="bottom" tickFormat={formatToTimeEveryOther} dependentAxis />
            <VictoryAxis
                orientation="left"
                name="time-axis"
                scale="linear"
                invertAxis
                tickValues={daysArray}
            />

            <VictoryBar
                y={d => toTimeDuration(convertDate(d.beginDate), convertDate(d.beginDate))}
                y0={d => toTimeDuration(convertDate(d.beginDate), convertDate(d.endDate))}
                x={d => formatToDay(convertDate(d.beginDate).startOf('day'))}
                barWidth={barHeight}
                data={onlineTimesValues}
                labelComponent={labelComponent(chartTheme)}
                labels={({ datum }) =>
                    `${convertDate(datum.beginDate).format(DAY_MONTH_LONG_FORMAT)}\r\n
                    Start time: ${convertDate(datum.beginDate).format(
                        TIME_FORMAT,
                    )}\r\nEnd time: ${convertDate(datum.endDate).format(
                        TIME_FORMAT,
                    )}\r\nDuration: ${diffAndFormatShort(datum.beginDate, datum.endDate)}`
                }
            />
            <VictoryBar
                y={d => toTimeDuration(convertDate(d.beginDate), convertDate(d.beginDate))}
                y0={d => addToTimeDuration(convertDate(d.beginDate), d.online)}
                x={d => formatToDay(convertDate(d.beginDate).startOf('day'))}
                barWidth={10}
                style={{ data: { fill: COLORS.green } }}
                data={onlineTimesValues}
                labelComponent={labelComponent(chartTheme)}
                labels={({ datum }) =>
                    `${convertDate(datum.beginDate).format(
                        DAY_MONTH_LONG_FORMAT,
                    )}\r\nWorked: ${moment.duration(datum.online).format()}`
                }
            />
        </VictoryChart>
    );
};
