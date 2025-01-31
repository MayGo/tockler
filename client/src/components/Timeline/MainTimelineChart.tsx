import { memo, useRef } from 'react';
import { debounce } from 'lodash';
import moment from 'moment';
import { VictoryAxis, VictoryBar, VictoryChart, VictoryZoomContainer, VictoryBrushLine } from 'victory';
import { convertDate, TIME_FORMAT } from '../../constants';
import { TrackItemType } from '../../enum/TrackItemType';
import { BarWithTooltip } from './BarWithTooltip';
import { Logger } from '../../logger';

import { colorProp } from '../charts.utils';
import { useChartThemeState } from '../../routes/ChartThemeProvider';
import { useStoreActions, useStoreState } from '../../store/easyPeasy';
import { rangeToDate } from '../../timeline.util';
import { BrushHandle } from './BrushHandle';
import { BAR_WIDTH, CHART_PADDING, CHART_SCALE } from './timeline.constants';
import useDimensions from 'react-cool-dimensions';
import { formatDurationInternal } from '../../utils';

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

const getTrackItemOrderFn = (d) => getTrackItemOrder(d.taskName);

const domainPadding: any = { y: 35, x: 10 };

export const barStyle: any = (isDark) => ({
    data: {
        width: BAR_WIDTH,
        fill: colorProp,
        stroke: isDark ? 'black' : 'white',
        strokeWidth: 0.5,
        fillOpacity: 1,
    },
});

export const MainTimelineChart = memo(() => {
    const { observe, width } = useDimensions();

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

    const changeVisibleTimerange = (range) => {
        setVisibleTimerange([moment(range[0]), moment(range[1])]);
    };

    const handleZoom = (domain) => {
        changeVisibleTimerange(domain.y);
    };

    const handleEditBrush = (domain, props) => {
        if (domain) {
            console.info('props', props);

            const beginDate = convertDate(domain[0]).valueOf();
            const endDate = convertDate(domain[1]).valueOf();

            Logger.debug('EditBrush changed:', beginDate, endDate);

            setSelectedTimelineItem({ ...selectedTimelineItem, beginDate, endDate });
        }
    };

    const getTooltipLabel = (d) => {
        const diff = convertDate(d.endDate).diff(convertDate(d.beginDate));

        const type = d.taskName === TrackItemType.StatusTrackItem ? 'STATUS' : d.app;
        const beginTime = convertDate(d.beginDate).format(TIME_FORMAT);
        const endTime = convertDate(d.endDate).format(TIME_FORMAT);

        const url = d.url ? `${d.url}\r\n` : '';
        return `${type}\r\n${d.title}\r\n${url}${beginTime} - ${endTime}\r\n${formatDurationInternal(diff)}`;
    };

    const { appItems, logItems, statusItems } = timeItems;

    if (!timerange && !appItems && appItems.length === 0) {
        return <div>No data</div>;
    }

    let timelineData = [...statusItems, ...logItems, ...appItems];

    Logger.debug(`Rendering ${timelineData.length} items`);

    const axisStyle = {
        grid: { strokeWidth: 0 },
        ticks: { stroke: 'gray', size: 5 },
    };

    const handleEditBrushDebounced = debounce(handleEditBrush, 300);

    const domain: any = {
        y: [timerange[0], timerange[1]],
        x: [1, 3],
    };

    return (
        <div ref={observe}>
            <VictoryChart
                theme={chartTheme}
                height={100}
                width={width}
                domainPadding={domainPadding}
                padding={CHART_PADDING}
                scale={CHART_SCALE}
                horizontal
                domain={domain}
                containerComponent={
                    <VictoryZoomContainer
                        responsive={false}
                        zoomDimension="y"
                        zoomDomain={{ y: rangeToDate(visibleTimerange) }}
                        key={selectedTimelineItem && selectedTimelineItem.id}
                        onZoomDomainChange={debounce(handleZoom, 300)}
                    />
                }
            >
                <VictoryAxis dependentAxis tickCount={20} />

                <VictoryBar
                    style={barStyle(chartTheme.isDark)}
                    x={getTrackItemOrderFn}
                    y={(d) => d.beginDate}
                    y0={(d) => d.endDate}
                    data={timelineData}
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
                    gridComponent={
                        <VictoryBrushLine
                            disable={
                                !selectedTimelineItem || selectedTimelineItem.taskName !== TrackItemType.LogTrackItem
                            }
                            width={BAR_WIDTH}
                            dimension="y"
                            brushDomain={[
                                selectedTimelineItem ? selectedTimelineItem.beginDate : 0,
                                selectedTimelineItem ? selectedTimelineItem.endDate : 0,
                            ]}
                            onBrushDomainChange={handleEditBrushDebounced}
                            brushStyle={{
                                pointerEvents: 'none',
                                stroke: chartTheme.isDark ? 'white' : 'black',
                                fill: chartTheme.isDark ? 'white' : 'black',
                                opacity: ({ active }) => (active ? 0.5 : 0.4),
                            }}
                            handleComponent={<BrushHandle viewBox="0 -2 8 30" />}
                            brushAreaStyle={{
                                stroke: 'none',
                                fill: 'transparent',
                                opacity: 0,
                            }}
                        />
                    }
                />
            </VictoryChart>
        </div>
    );
});
