import React, { useContext } from 'react';
import moment from 'moment';
import { VictoryBar, VictoryChart, VictoryAxis, VictoryTooltip } from 'victory';
import { convertDate, TIME_FORMAT, COLORS } from '../../constants';
import { chartTheme } from '../Timeline/ChartTheme';
import { useWindowWidth } from '@react-hook/window-size/throttled';
import { SummaryContext } from '../../SummaryContext';
import {
    addToTimeDuration,
    formatToTimeEveryOther,
    formatToDay,
    toTimeDuration,
} from './LineChart.util';
import { diffAndFormatShort } from '../../utils';

const scale = { x: 'time', y: 'time' };
const padding = { left: 50, top: 0, bottom: 20, right: 10 };
const domainPadding = { y: 10, x: 10 };
const labelComponent = () => (
    <VictoryTooltip
        style={chartTheme.tooltip.style}
        cornerRadius={chartTheme.tooltip.cornerRadius}
        pointerLength={chartTheme.tooltip.pointerLength}
        flyoutStyle={chartTheme.tooltip.flyoutStyle}
        renderInPortal
        horizontal={false}
    />
);
export const LineChart = () => {
    const chartWidth = useWindowWidth();
    const { onlineTimesSummary } = useContext(SummaryContext);

    return (
        <VictoryChart
            theme={chartTheme}
            scale={scale}
            width={chartWidth}
            height={500}
            domainPadding={domainPadding}
            padding={padding}
            horizontal
        >
            <VictoryAxis
                orientation="bottom"
                tickCount={24}
                tickFormat={formatToTimeEveryOther}
                dependentAxis
            />
            <VictoryAxis orientation="left" name="time-axis" tickFormat={formatToDay} />
            <VictoryBar
                y={d => toTimeDuration(convertDate(d.beginDate), convertDate(d.beginDate))}
                y0={d => toTimeDuration(convertDate(d.beginDate), convertDate(d.endDate))}
                x={d => convertDate(d.beginDate).startOf('day')}
                barWidth={10}
                data={onlineTimesSummary}
                labelComponent={labelComponent()}
                labels={({ datum }) =>
                    `Start time: ${convertDate(datum.beginDate).format(
                        TIME_FORMAT,
                    )}\r\nEnd time: ${convertDate(datum.endDate).format(
                        TIME_FORMAT,
                    )}\r\nDuration: ${diffAndFormatShort(datum.beginDate, datum.endDate)}`
                }
            />
            <VictoryBar
                y={d => toTimeDuration(convertDate(d.beginDate), convertDate(d.beginDate))}
                y0={d => addToTimeDuration(convertDate(d.beginDate), d.online)}
                x={d => convertDate(d.beginDate).startOf('day')}
                barWidth={10}
                style={{ data: { fill: COLORS.green } }}
                data={onlineTimesSummary}
                labelComponent={labelComponent()}
                labels={({ datum }) => `Worked: ${moment.duration(datum.online).format()}`}
            />
        </VictoryChart>
    );
};
