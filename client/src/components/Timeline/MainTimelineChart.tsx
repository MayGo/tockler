import { memo, useRef } from 'react';
import {
    DomainPaddingPropType,
    VictoryAxis,
    VictoryBar,
    VictoryBrushLine,
    VictoryChart,
    VictoryStyleInterface,
} from 'victory';
import { convertDate, TIME_FORMAT } from '../../constants';
import { TrackItemType } from '../../enum/TrackItemType';
import { Logger } from '../../logger';
import { BarWithTooltip } from './BarWithTooltip';

import { Box, IconButton, Tooltip } from '@chakra-ui/react';
import { RxZoomIn, RxZoomOut } from 'react-icons/rx';
import { useDebouncedCallback } from 'use-debounce';
import { ITrackItem } from '../../@types/ITrackItem';
import { useChartThemeState } from '../../routes/ChartThemeProvider';
import { useStoreActions, useStoreState } from '../../store/easyPeasy';
import { rangeToDate } from '../../timeline.util';
import { formatDurationInternal } from '../../utils';
import { colorProp } from '../charts.utils';
import { BrushHandle } from './BrushHandle';
import { BAR_WIDTH, CHART_PADDING, CHART_SCALE } from './timeline.constants';
import { getDynamicTimeFormat } from './timeline.format.utils';
import { getTrackItemOrderFn } from './timeline.utils';

import { useMeasure } from '@uidotdev/usehooks';
import { shortTime } from '../../time.util';

const domainPadding: DomainPaddingPropType = { y: 35, x: 10 };

export const barStyle = (isDark: boolean): VictoryStyleInterface => ({
    data: {
        width: BAR_WIDTH,
        fill: colorProp,
        stroke: isDark ? 'black' : 'white',
        strokeWidth: 0.5,
        fillOpacity: 1,
        clipPath: 'none',
    },
});

const EMPTY_ARRAY: ITrackItem[] = [];

// Minimum timerange duration in milliseconds (5 minutes)
const MIN_TIMERANGE_DURATION_MS = 5 * 60 * 1000;

export const MainTimelineChart = memo(() => {
    const [ref, { width }] = useMeasure();

    const { chartTheme } = useChartThemeState();
    const popoverTriggerRef = useRef(null);

    const timerange = useStoreState((state) => state.timerange);
    const visibleTimerange = useStoreState((state) => state.visibleTimerange);
    const timeItems = useStoreState((state) => state.timeItems);

    const setVisibleTimerange = useStoreActions((actions) => actions.setVisibleTimerange);

    const selectedTimelineItem = useStoreState((state) => state.selectedTimelineItem);
    const setSelectedTimelineItem = useStoreActions((actions) => actions.setSelectedTimelineItem);

    const handleSelectionChanged = (item) => {
        if (item) {
            Logger.debug('Selected item:', item);
            setSelectedTimelineItem(item);
        } else {
            Logger.error('No item selected');
        }
    };

    // Zoom handlers for manual zoom buttons
    const zoomIn = () => {
        if (visibleTimerange) {
            const [start, end] = visibleTimerange;
            const currentDuration = end.diff(start).milliseconds;

            // Calculate the new duration, but don't go below minimum
            const newDuration = Math.max(currentDuration / 2, MIN_TIMERANGE_DURATION_MS);

            const midpoint = start.plus({ milliseconds: currentDuration / 2 });
            const newStart = midpoint.minus({ milliseconds: newDuration / 2 });
            const newEnd = midpoint.plus({ milliseconds: newDuration / 2 });

            setVisibleTimerange([newStart, newEnd]);
        }
    };

    const zoomOut = () => {
        if (visibleTimerange && timerange) {
            const [start, end] = visibleTimerange;
            const midpoint = start.plus({ milliseconds: end.diff(start).milliseconds / 2 });
            const newDuration = end.diff(start).milliseconds * 2;

            // Constrain to original timerange
            const [fullStart, fullEnd] = timerange;
            const maxDuration = fullEnd.diff(fullStart).milliseconds;
            const actualDuration = Math.min(newDuration, maxDuration);

            const newStart = midpoint.minus({ milliseconds: actualDuration / 2 });
            const newEnd = midpoint.plus({ milliseconds: actualDuration / 2 });

            setVisibleTimerange([newStart, newEnd]);
        }
    };

    const handleEditBrush = useDebouncedCallback((domain, brushProps) => {
        if (domain) {
            console.info('EditBrush event received:', domain, brushProps);

            const beginDate = convertDate(domain[0]).valueOf();
            const endDate = convertDate(domain[1]).valueOf();

            Logger.debug('EditBrush changed:', beginDate, endDate);

            if (selectedTimelineItem) {
                setSelectedTimelineItem({ ...selectedTimelineItem, beginDate, endDate });
            } else {
                Logger.error('No item selected');
            }
        }
    }, 200);

    const getTooltipLabel = (d) => {
        const diff = convertDate(d.endDate).diff(convertDate(d.beginDate));
        const now = convertDate(new Date());
        const ago = now.diff(convertDate(d.endDate));

        const type = d.taskName === TrackItemType.StatusTrackItem ? 'STATUS' : d.app;
        const beginTime = convertDate(d.beginDate).toFormat(TIME_FORMAT);
        const endTime = convertDate(d.endDate).toFormat(TIME_FORMAT);
        const agoText = `${shortTime(ago.milliseconds, { largest: 2 })} ago`;

        const url = d.url ? `${d.url}\r\n` : '';
        return `${type}\r\n${d.title}\r\n${url}${beginTime} - ${endTime}\r\n${formatDurationInternal(
            diff.milliseconds,
        )}\r\n${agoText}`;
    };

    const appItems = timeItems[TrackItemType.AppTrackItem] || EMPTY_ARRAY;
    const logItems = timeItems[TrackItemType.LogTrackItem] || EMPTY_ARRAY;
    const statusItems = timeItems[TrackItemType.StatusTrackItem] || EMPTY_ARRAY;

    if (!timerange && appItems.length === 0) {
        return <div>No data</div>;
    }

    const timelineData = [...statusItems, ...logItems, ...appItems];

    Logger.debug(`Rendering ${timelineData.length} items`);

    const axisStyle = {
        grid: { strokeWidth: 0 },
        ticks: { stroke: 'gray', size: 5 },
    };

    return (
        <div ref={ref}>
            <Box
                position="absolute"
                bottom={2}
                right={2}
                display="flex"
                zIndex={2}
                backgroundColor={chartTheme.isDark ? 'gray.800' : 'white'}
                borderRadius={5}
            >
                <Tooltip label="Zoom In" placement="top">
                    <IconButton
                        aria-label="Zoom In"
                        icon={<RxZoomIn />}
                        onClick={zoomIn}
                        size="sm"
                        colorScheme="gray"
                        variant="ghost"
                    />
                </Tooltip>
                <Tooltip label="Zoom Out" placement="top">
                    <IconButton
                        aria-label="Zoom Out"
                        icon={<RxZoomOut />}
                        onClick={zoomOut}
                        size="sm"
                        colorScheme="gray"
                        variant="ghost"
                    />
                </Tooltip>
            </Box>
            <VictoryChart
                theme={chartTheme}
                height={100}
                width={width ?? 0}
                domainPadding={domainPadding}
                padding={CHART_PADDING}
                scale={CHART_SCALE}
                horizontal
                domain={{
                    y: rangeToDate(visibleTimerange || timerange),
                    x: [1, 3],
                }}
            >
                <VictoryAxis
                    dependentAxis
                    tickCount={20}
                    tickFormat={(timestamp: number) => getDynamicTimeFormat(timestamp, visibleTimerange)}
                />

                <VictoryBar
                    style={barStyle(chartTheme.isDark)}
                    x={getTrackItemOrderFn}
                    y={(d) => d.beginDate}
                    y0={(d) => d.endDate}
                    data={timelineData}
                    barWidth={BAR_WIDTH}
                    horizontal={true}
                    dataComponent={
                        <BarWithTooltip
                            popoverTriggerRef={popoverTriggerRef}
                            theme={chartTheme}
                            getTooltipLabel={getTooltipLabel}
                            onClickBarItem={handleSelectionChanged}
                            centerTime
                        />
                    }
                />
                <VictoryAxis
                    tickValues={[3]}
                    tickFormat={['']}
                    style={axisStyle}
                    name={`brush-${selectedTimelineItem ? selectedTimelineItem.id : 'no-item'}`}
                    gridComponent={
                        <VictoryBrushLine
                            disable={
                                !selectedTimelineItem || selectedTimelineItem.taskName !== TrackItemType.LogTrackItem
                            }
                            width={BAR_WIDTH}
                            brushWidth={BAR_WIDTH}
                            dimension="y"
                            brushDomain={[
                                selectedTimelineItem ? selectedTimelineItem.beginDate : 0,
                                selectedTimelineItem ? selectedTimelineItem.endDate : 0,
                            ]}
                            onBrushDomainChange={handleEditBrush}
                            brushStyle={{
                                fill: chartTheme.isDark ? '#7C3AED' : '#A78BFA',
                                opacity: ({ active }) => (active ? 0.7 : 0.5),
                                cursor: 'move',
                                strokeWidth: 1.5,
                            }}
                            handleComponent={<BrushHandle smaller={true} />}
                            handleWidth={10}
                            brushAreaWidth={BAR_WIDTH * 2}
                            brushAreaStyle={{
                                stroke: 'none',
                                fill: 'transparent',
                                opacity: 0.4,
                                cursor: 'move',
                                pointerEvents: 'all',
                            }}
                            allowDrag={true}
                            allowResize={true}
                            allowDraw={true}
                        />
                    }
                />
            </VictoryChart>
        </div>
    );
});
