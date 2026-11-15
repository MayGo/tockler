import { DateTime } from 'luxon';
import { memo, useEffect, useRef, useState } from 'react';
import {
    DomainPaddingPropType,
    DomainTuple,
    ForAxes,
    VictoryAxis,
    VictoryBar,
    VictoryBrushContainer,
    VictoryChart,
    VictoryStyleInterface,
} from 'victory';

import { Logger } from '../../logger';

import { useChartThemeState } from '../../routes/ChartThemeProvider';
import { useStoreActions, useStoreState } from '../../store/easyPeasy';
import { TIMERANGE_MODE_TODAY } from '../../store/mainStore';
import { rangeToDate } from '../../timeline.util';

import { useMeasure } from '@uidotdev/usehooks';
import { ITrackItem } from '../../@types/ITrackItem';
import { TrackItemType } from '../../enum/TrackItemType';
import { BrushHandle } from './BrushHandle';
import { CHART_PADDING, CHART_SCALE } from './timeline.constants';
import { getDynamicTimeFormat } from './timeline.format.utils';
import { getTrackItemOrderFn } from './timeline.utils';
import { matchesLast, titleHighlightBarStyle } from './titleSearch.utils';
import { useSetVisibleRange } from './useSetVisibleRange';
import { useTitleSearchMatches } from './useTitleSearchMatches';

const domainPaddingBrush: DomainPaddingPropType = { y: 35, x: 5 };

const brushChartBarStyle = (isDark: boolean, keyword: string): VictoryStyleInterface => ({
    data: {
        width: 7,
        ...titleHighlightBarStyle(keyword, { isDark, stroke: isDark ? 'black' : 'white', strokeWidth: 0.5 }),
    },
});

const xDomain: DomainTuple = [1, 3];

/** Width Victory treats as a handle when deciding between resize, move and a new selection. */
const BRUSH_HANDLE_HIT_WIDTH = 16;

const EMPTY_ARRAY: ITrackItem[] = [];

export const SmallTimelineChart = memo(() => {
    const { chartTheme } = useChartThemeState();

    const [ref, { width }] = useMeasure();

    const timerange = useStoreState((state) => state.timerange);
    const visibleTimerange = useStoreState((state) => state.visibleTimerange);
    const timeItems = useStoreState((state) => state.timeItems);
    const { keyword, matchedItems } = useTitleSearchMatches();
    const setVisibleRange = useSetVisibleRange();
    const timerangeMode = useStoreState((state) => state.timerangeMode);
    const setLiveView = useStoreActions((actions) => actions.setLiveView);

    // Victory's brush keeps its own copy of the selected range and, when the brushDomain prop goes back to a value it
    // has cached, hit-tests the handles against that stale copy, so pressing a handle starts a new selection.
    // Remount the brush whenever the range changes from anywhere but the brush itself (presets, zoom, live view).
    const rangeKey = `${visibleTimerange[0].toMillis()}-${visibleTimerange[1].toMillis()}`;
    const ownRangeKeyRef = useRef(rangeKey);
    const [brushVersion, setBrushVersion] = useState(0);
    useEffect(() => {
        if (rangeKey !== ownRangeKeyRef.current) {
            ownRangeKeyRef.current = rangeKey;
            setBrushVersion((version) => version + 1);
        }
    }, [rangeKey]);

    // Live view would move the range under the pointer; stop it as soon as a drag starts.
    const isDraggingRef = useRef(false);
    const handleBrushMove = () => {
        if (!isDraggingRef.current) {
            isDraggingRef.current = true;
            if (timerangeMode === TIMERANGE_MODE_TODAY) {
                setLiveView(false);
            }
        }
    };

    // Apply the range once, when the drag ends, rather than while the handle is still moving.
    const handleBrushEnd = (brushDomain: { y?: DomainTuple }) => {
        isDraggingRef.current = false;
        if (!brushDomain.y) {
            return;
        }
        const [begin, end] = brushDomain.y.map((value) => DateTime.fromMillis(new Date(value).getTime()));
        Logger.debug('Selected with brush:', begin.toISO(), end.toISO());
        const applied = setVisibleRange([begin, end], { pinsPosition: true });
        ownRangeKeyRef.current = `${applied[0].toMillis()}-${applied[1].toMillis()}`;
    };

    const appTrackItems = timeItems[TrackItemType.AppTrackItem] || EMPTY_ARRAY;
    const logTrackItems = timeItems[TrackItemType.LogTrackItem] || EMPTY_ARRAY;
    const statusTrackItems = timeItems[TrackItemType.StatusTrackItem] || EMPTY_ARRAY;

    if (!timerange && appTrackItems.length === 0) {
        return <div>No data</div>;
    }

    // App items are normally left out of the overview; while searching, the matching ones are added
    // so the whole day shows where they occurred.
    const matchedAppItems = matchedItems.filter((item) => item.taskName === TrackItemType.AppTrackItem);
    const brushData = matchesLast([...statusTrackItems, ...logTrackItems, ...matchedAppItems], keyword);

    const domain: ForAxes<DomainTuple> = {
        y: [timerange[0].toMillis(), timerange[1].toMillis()],
        x: xDomain,
    };

    return (
        <div ref={ref}>
            <VictoryChart
                key={brushVersion}
                theme={chartTheme}
                height={50}
                width={width ?? 0}
                domainPadding={domainPaddingBrush}
                padding={CHART_PADDING}
                horizontal
                scale={CHART_SCALE}
                domain={domain}
                containerComponent={
                    <VictoryBrushContainer
                        responsive={false}
                        brushDimension="y"
                        brushDomain={{ y: rangeToDate(visibleTimerange) }}
                        brushStyle={{
                            stroke: '#A78BFA',
                            fill: chartTheme.isDark ? '#7C3AED' : '#7C3AED',
                            fillOpacity: 0.5,
                        }}
                        handleComponent={<BrushHandle />}
                        handleWidth={BRUSH_HANDLE_HIT_WIDTH}
                        defaultBrushArea="none"
                        onBrushDomainChange={handleBrushMove}
                        onBrushDomainChangeEnd={handleBrushEnd}
                    />
                }
            >
                <VictoryAxis
                    dependentAxis
                    tickCount={20}
                    tickFormat={(timestamp: number) => getDynamicTimeFormat(timestamp, visibleTimerange)}
                />

                <VictoryBar
                    animate={false}
                    style={brushChartBarStyle(chartTheme.isDark, keyword)}
                    x={getTrackItemOrderFn}
                    y={(d) => d.beginDate}
                    y0={(d) => d.endDate}
                    data={brushData}
                />
            </VictoryChart>
        </div>
    );
});
