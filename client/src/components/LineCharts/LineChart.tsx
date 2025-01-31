import { useContext } from 'react';
import { values } from 'lodash';
import {
    VictoryBar,
    VictoryChart,
    VictoryAxis,
    VictoryTooltip,
    VictoryVoronoiContainer,
    VictoryScatter,
} from 'victory';
import { convertDate, DAY_MONTH_LONG_FORMAT, COLORS, TIME_FORMAT } from '../../constants';
import { IoMdSunny, IoMdMoon } from 'react-icons/io';
import { SummaryContext } from '../../SummaryContext';
import { dateToDayLabel, formatToHours } from './LineChart.util';
import { useChartThemeState } from '../../routes/ChartThemeProvider';
import { BAR_WIDTH } from '../Timeline/timeline.constants';
import { BlackBox } from '../BlackBox';
import useDimensions from 'react-cool-dimensions';
import { formatDurationInternal } from '../../utils';

const scale: any = { x: 'time', y: 'linear' };
const padding: any = { left: 25, top: 20, bottom: 30, right: 10 };
const domainPadding: any = { y: 0, x: [BAR_WIDTH, 0] };

const labelComponent = (theme) => (
    <VictoryTooltip
        style={theme.tooltip.style}
        cornerRadius={theme.tooltip.cornerRadius}
        pointerLength={theme.tooltip.pointerLength}
        flyoutStyle={theme.tooltip.flyoutStyle}
        renderInPortal
        horizontal={false}
    />
);

const formatToTime = (d) => convertDate(d).format(TIME_FORMAT);
const formatToLong = (d) => convertDate(d).format(DAY_MONTH_LONG_FORMAT);

const dateToMinutes = (max, useStartDate) => (d) => {
    const m = convertDate(useStartDate ? d.beginDate : d.endDate);
    const minutes = m.hour() * 60 + m.minute();

    return minutes / 60 / max;
};

const ScatterPoint = ({ x = 0, y = 0, showMoon = false, showSun = false }) => {
    if (showMoon) {
        return <IoMdMoon fontSize="20px" x={x - 10} y={y - 10} />;
    }
    if (showSun) {
        return <IoMdSunny fontSize="20px" x={x - 10} y={y - 10} />;
    }
    return null;
};

const getXAxisDay = (d) => convertDate(d.beginDate).startOf('day').valueOf();

export const LineChart = () => {
    const { chartTheme } = useChartThemeState();
    const { observe, width } = useDimensions();
    const { onlineTimesSummary, selectedDate } = useContext(SummaryContext);

    const onlineTimesValues = values(onlineTimesSummary);

    const daysInMonth = selectedDate.daysInMonth();

    const domain: any = {
        x: [selectedDate.startOf('month').toDate(), selectedDate.endOf('month').toDate()],
        y: [0, 1],
    };

    const maxOnline = Math.max(...onlineTimesValues.map((d) => d.online));
    const maxHours = 24;

    const axisStyle = {
        grid: { strokeWidth: 0 },
        ticks: { stroke: 'gray', size: 5 },
    };

    const isNarrow = width < 1400;

    return (
        <div ref={observe}>
            <BlackBox position="absolute" width={width - 34} height={770} right={0} mr="25px" />
            <VictoryChart
                theme={chartTheme}
                scale={scale}
                domain={domain}
                width={width}
                height={800}
                padding={padding}
                domainPadding={domainPadding}
                containerComponent={
                    <VictoryVoronoiContainer
                        voronoiDimension="x"
                        responsive={false}
                        labelComponent={labelComponent(chartTheme)}
                        labels={({ datum }) => {
                            const { childName, beginDate, endDate, online } = datum;
                            if (childName === 'beginDate') {
                                return `Start time: ${formatToTime(beginDate)}`;
                            }
                            if (childName === 'endDate') {
                                return `End time: ${formatToTime(endDate)}`;
                            }
                            if (childName === 'online') {
                                return `${formatToLong(datum.beginDate)}\r\nWorked: ${formatDurationInternal(online)}`;
                            }
                            return '';
                        }}
                    />
                }
            >
                <VictoryAxis orientation="left" tickFormat={formatToHours(maxOnline)} dependentAxis />
                <VictoryAxis
                    orientation="bottom"
                    name="time-axis"
                    scale="linear"
                    tickCount={daysInMonth}
                    tickFormat={dateToDayLabel(isNarrow)}
                    style={axisStyle}
                    offsetY={20}
                />

                <VictoryBar
                    name="online"
                    x={getXAxisDay}
                    y={(d) => d.online / maxOnline}
                    barWidth={BAR_WIDTH}
                    style={{ data: { fill: COLORS.green } }}
                    data={onlineTimesValues}
                />
                <VictoryScatter
                    name="beginDate"
                    data={onlineTimesValues}
                    x={getXAxisDay}
                    y={dateToMinutes(maxHours, true)}
                    dataComponent={<ScatterPoint showSun />}
                />
                <VictoryScatter
                    name="endDate"
                    data={onlineTimesValues}
                    x={getXAxisDay}
                    y={dateToMinutes(maxHours, false)}
                    dataComponent={<ScatterPoint showMoon />}
                />
            </VictoryChart>
        </div>
    );
};
