import { debounce } from 'lodash';
import { DateTime } from 'luxon';
import { memo, useCallback, useRef } from 'react';
import {
    DomainPaddingPropType,
    DomainTuple,
    ForAxes,
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

import useDimensions from 'react-cool-dimensions';
import { ITrackItem } from '../../@types/ITrackItem';
import { useChartThemeState } from '../../routes/ChartThemeProvider';
import { useStoreActions, useStoreState } from '../../store/easyPeasy';
import { rangeToDate } from '../../timeline.util';
import { formatDurationInternal } from '../../utils';
import { colorProp } from '../charts.utils';
import { BrushHandle } from './BrushHandle';
import { BAR_WIDTH, CHART_PADDING, CHART_SCALE } from './timeline.constants';

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

const domainPadding: DomainPaddingPropType = { y: 35, x: 10 };

export const barStyle = (isDark: boolean): VictoryStyleInterface => ({
    data: {
        width: BAR_WIDTH,
        fill: colorProp,
        stroke: isDark ? 'black' : 'white',
        strokeWidth: 0.5,
        fillOpacity: 1,
    },
});

const EMPTY_ARRAY: ITrackItem[] = [];

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
        setVisibleTimerange([DateTime.fromMillis(range[0]), DateTime.fromMillis(range[1])]);
    };

    const handleZoom = (domain) => {
        changeVisibleTimerange(domain.y);
    };

    const handleEditBrush = useCallback(
        (domain, props) => {
            if (domain) {
                console.info('EditBrush event received:', domain, props);

                const beginDate = convertDate(domain[0]).valueOf();
                const endDate = convertDate(domain[1]).valueOf();

                Logger.debug('EditBrush changed:', beginDate, endDate);

                if (selectedTimelineItem && selectedTimelineItem.id) {
                    setSelectedTimelineItem({ ...selectedTimelineItem, beginDate, endDate });
                } else {
                    Logger.error('No item selected');
                }
            }
        },
        [selectedTimelineItem, setSelectedTimelineItem],
    );

    const handleEditBrushDebounced = useCallback(
        debounce((domain, props) => handleEditBrush(domain, props), 200),
        [handleEditBrush],
    );

    const getTooltipLabel = (d) => {
        const diff = convertDate(d.endDate).diff(convertDate(d.beginDate));

        const type = d.taskName === TrackItemType.StatusTrackItem ? 'STATUS' : d.app;
        const beginTime = convertDate(d.beginDate).toFormat(TIME_FORMAT);
        const endTime = convertDate(d.endDate).toFormat(TIME_FORMAT);

        const url = d.url ? `${d.url}\r\n` : '';
        return `${type}\r\n${d.title}\r\n${url}${beginTime} - ${endTime}\r\n${formatDurationInternal(
            diff.milliseconds,
        )}`;
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

    const domain: ForAxes<DomainTuple> = {
        y: rangeToDate(timerange),
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
                // containerComponent={
                //     <VictoryZoomContainer
                //         responsive={false}
                //         zoomDimension="y"
                //         zoomDomain={{ y: rangeToDate(visibleTimerange) }}
                //         key={selectedTimelineItem && selectedTimelineItem.id}
                //         onZoomDomainChange={debounce(handleZoom, 300)}
                //     />
                // }
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
                    key={`axis-${selectedTimelineItem ? selectedTimelineItem.id : 'no-item'}`}
                    gridComponent={
                        <VictoryBrushLine
                            key={`brush-${selectedTimelineItem ? selectedTimelineItem.id : 'no-item'}`}
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
                            onBrushDomainChange={handleEditBrushDebounced}
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
                        />
                    }
                />
            </VictoryChart>
        </div>
    );
});
