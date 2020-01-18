import React, { memo, useState } from 'react';

import { useWindowWidth } from '@react-hook/window-size/throttled';
import { Popover, Spin } from 'antd';
import { debounce } from 'lodash';
import moment from 'moment';
import 'moment-duration-format';
import {
    VictoryAxis,
    VictoryBar,
    VictoryBrushContainer,
    VictoryChart,
    VictoryZoomContainer,
} from 'victory';
import { convertDate, TIME_FORMAT } from '../../constants';
import { TimelineRowType } from '../../enum/TimelineRowType';
import { TrackItemType } from '../../enum/TrackItemType';
import { BarWithTooltip } from './BarWithTooltip';
import { blueGrey700, chartTheme, disabledGrey } from './ChartTheme';
import { BrushChart, MainChart, Spinner } from './Timeline.styles';
import { TimelineItemEditContainer } from './TimelineItemEditContainer';
import { Logger } from '../../logger';
import { formatDuration } from '../SummaryCalendar/SummaryCalendar.util';
import { colorProp } from '../charts.utils';

interface IProps {
    timerange: any;
    visibleTimerange: any;
    setVisibleTimerange?: any;

    timeItems: any;

    selectedTimelineItem?: any;
    setSelectedTimelineItem?: any;
    toggleRow?: any;

    chartWidth?: number;
    isLoading?: boolean;
    isRowEnabled?: any;
}

type IFullProps = IProps;

const getTrackItemOrder = (type: string) => {
    if (type === TrackItemType.AppTrackItem) {
        return 1;
    }
    if (type === TrackItemType.StatusTrackItem) {
        return 2;
    }
    if (type === TrackItemType.LogTrackItem) {
        return 3;
    }
    return 0;
};

const getTrackItemOrderFn = d => getTrackItemOrder(d.taskName);
const contertDateForY = d => convertDate(d.beginDate);
const contertDateForY0 = d => convertDate(d.endDate);
const brushStyle = {
    data: {
        width: 7,
        fill: colorProp,
        stroke: colorProp,
        strokeWidth: 0.5,
        fillOpacity: 0.75,
    },
};

const barWidth = 25;

const scale = { y: 'time', x: 'linear' };
const padding = { left: 50, top: 0, bottom: 20, right: 10 };
const domainPadding = { y: 35, x: 10 };
const domainPaddingBrush = { y: 35, x: 5 };

const barStyle = {
    data: {
        width: barWidth,
        fill: colorProp,
        stroke: colorProp,
        strokeWidth: 0.5,
        fillOpacity: 0.75,
    },
};

const rowEnabledDefaults = {
    [TimelineRowType.App]: true,
    [TimelineRowType.Log]: true,
    [TimelineRowType.Status]: true,
};

export const Timeline = memo<IFullProps>(
    ({ timerange, visibleTimerange, setVisibleTimerange, isLoading, timeItems }) => {
        const [selectedTimelineItem, setSelectedTimelineItem] = useState<any>();
        const [isRowEnabled, setIsRowEnabled] = useState<any>(rowEnabledDefaults);

        const chartWidth = useWindowWidth();
        const toggleRow = (rowId: any) => {
            setIsRowEnabled({ ...isRowEnabled, [rowId]: !isRowEnabled[rowId] });
        };

        const handleSelectionChanged = item => {
            if (item) {
                Logger.debug('Selected item:', item);
                setSelectedTimelineItem(item);
            } else {
                Logger.error('No item selected');
            }
        };
        const changeVisibleTimerange = range => {
            setVisibleTimerange([moment(range[0]), moment(range[1])]);
        };

        const handleZoom = domain => {
            changeVisibleTimerange(domain.y);
        };

        const handleBrush = domain => {
            Logger.debug('Selected with brush:', domain.y);

            changeVisibleTimerange(domain.y);
        };
        const calcRowEnabledColor = ({ index }) => {
            return isRowEnabled[index] ? blueGrey700 : disabledGrey;
        };
        const calcRowEnabledColorFlipped = index => {
            return !isRowEnabled[index] ? blueGrey700 : disabledGrey;
        };

        const getTooltipLabel = d => {
            const diff = convertDate(d.endDate).diff(convertDate(d.beginDate));

            const type = d.taskName === TrackItemType.StatusTrackItem ? 'STATUS' : d.app;
            const beginTime = convertDate(d.beginDate).format(TIME_FORMAT);
            const endTime = convertDate(d.endDate).format(TIME_FORMAT);

            return `${type}\r\n${d.title}\r\n${beginTime} - ${endTime}\r\n${formatDuration(
                moment.duration(diff),
            )}`;
        };

        const { appItems, logItems, statusItems } = timeItems;

        if (!timerange && !appItems && appItems.length === 0) {
            return <div>No data</div>;
        }

        let timelineData = [];
        let brushData = [];
        if (isRowEnabled[TimelineRowType.Status]) {
            // Logger.log('Adding statusItems:', statusItems);
            timelineData = timelineData.concat(statusItems);
            brushData = brushData.concat(statusItems);
        }
        if (isRowEnabled[TimelineRowType.Log]) {
            // Logger.log('Adding logItems:', logItems);
            timelineData = timelineData.concat(logItems);
            brushData = brushData.concat(logItems);
        }
        if (isRowEnabled[TimelineRowType.App]) {
            // Logger.log('Adding appItems:', appItems);
            timelineData = timelineData.concat(appItems);
        }

        Logger.debug(`Rendering ${timelineData.length} items`);

        const axisEvents = [
            {
                target: 'tickLabels',
                eventHandlers: {
                    onClick: () => {
                        return [
                            {
                                target: 'tickLabels',
                                mutation: props => {
                                    toggleRow(props.datum);
                                    return {
                                        style: {
                                            ...props.style,
                                            fill: calcRowEnabledColorFlipped(props.datum),
                                        },
                                    };
                                },
                            },
                        ];
                    },
                },
            },
        ];

        const axisStyle = {
            grid: { strokeWidth: 0 },
            ticks: { stroke: 'grey', size: 5 },
            tickLabels: {
                fill: calcRowEnabledColor,
            },
        };

        const handleBrushDebounced = debounce(handleBrush, 300);

        const domain = {
            y: [convertDate(timerange[0]), convertDate(timerange[1])],
            x: [1, 3],
        };

        return (
            <div>
                <MainChart>
                    {isLoading && (
                        <Spinner>
                            <Spin />
                        </Spinner>
                    )}
                    <Popover
                        style={{ zIndex: 930 }}
                        content={
                            <TimelineItemEditContainer
                                selectedTimelineItem={selectedTimelineItem}
                                setSelectedTimelineItem={setSelectedTimelineItem}
                                showDeleteBtn
                                showCloseBtn
                            />
                        }
                        visible={!!selectedTimelineItem}
                        trigger="click"
                    >
                        <VictoryChart
                            theme={chartTheme}
                            height={100}
                            width={chartWidth}
                            domainPadding={domainPadding}
                            padding={padding}
                            scale={scale}
                            horizontal
                            domain={domain}
                            containerComponent={
                                <VictoryZoomContainer
                                    responsive={false}
                                    zoomDimension="y"
                                    zoomDomain={{ y: visibleTimerange }}
                                    onZoomDomainChange={debounce(handleZoom, 300)}
                                />
                            }
                        >
                            <VictoryAxis
                                tickValues={[1, 2, 3]}
                                tickFormat={['App', 'Status', 'Log']}
                                events={axisEvents}
                                style={axisStyle}
                            />
                            <VictoryAxis dependentAxis tickCount={20} />

                            <VictoryBar
                                style={barStyle}
                                x={getTrackItemOrderFn}
                                y={contertDateForY}
                                y0={contertDateForY0}
                                data={timelineData}
                                dataComponent={
                                    <BarWithTooltip
                                        getTooltipLabel={getTooltipLabel}
                                        onClickBarItem={handleSelectionChanged}
                                    />
                                }
                            />
                        </VictoryChart>
                    </Popover>
                </MainChart>
                <BrushChart>
                    <VictoryChart
                        theme={chartTheme}
                        height={50}
                        width={chartWidth}
                        domainPadding={domainPaddingBrush}
                        padding={padding}
                        horizontal
                        scale={scale}
                        domain={domain}
                        containerComponent={
                            <VictoryBrushContainer
                                responsive={false}
                                brushDimension="y"
                                brushDomain={{ y: visibleTimerange }}
                                onBrushDomainChange={handleBrushDebounced}
                            />
                        }
                    >
                        <VictoryAxis dependentAxis tickCount={20} />

                        <VictoryBar
                            animate={false}
                            style={brushStyle}
                            x={getTrackItemOrderFn}
                            y={contertDateForY}
                            y0={contertDateForY0}
                            data={brushData}
                        />
                    </VictoryChart>
                </BrushChart>
            </div>
        );
    },
);
