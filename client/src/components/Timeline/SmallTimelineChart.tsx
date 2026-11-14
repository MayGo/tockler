import { debounce } from 'lodash';
import { DateTime } from 'luxon';
import { memo } from 'react';
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
import { rangeToDate } from '../../timeline.util';

import { useMeasure } from '@uidotdev/usehooks';
import { ITrackItem } from '../../@types/ITrackItem';
import { TrackItemType } from '../../enum/TrackItemType';
import { clampRange } from '../PieCharts/MetricTiles.utils';
import { BrushHandle } from './BrushHandle';
import { CHART_PADDING, CHART_SCALE } from './timeline.constants';
import { getDynamicTimeFormat } from './timeline.format.utils';
import { getTrackItemOrderFn } from './timeline.utils';
import { matchesLast, titleHighlightBarStyle } from './titleSearch.utils';
import { useTitleSearchMatches } from './useTitleSearchMatches';

const domainPaddingBrush: DomainPaddingPropType = { y: 35, x: 5 };

const brushChartBarStyle = (isDark: boolean, keyword: string): VictoryStyleInterface => ({
    data: {
        width: 7,
        ...titleHighlightBarStyle(keyword, { isDark, stroke: isDark ? 'black' : 'white', strokeWidth: 0.5 }),
    },
});

const xDomain: DomainTuple = [1, 3];

const EMPTY_ARRAY: ITrackItem[] = [];

export const SmallTimelineChart = memo(() => {
    const { chartTheme } = useChartThemeState();

    const [ref, { width }] = useMeasure();

    const timerange = useStoreState((state) => state.timerange);
    const visibleTimerange = useStoreState((state) => state.visibleTimerange);
    const timeItems = useStoreState((state) => state.timeItems);
    const { keyword, matchedItems } = useTitleSearchMatches();
    const setVisibleTimerange = useStoreActions((actions) => actions.setVisibleTimerange);
    const setLiveView = useStoreActions((actions) => actions.setLiveView);
    const changeVisibleTimerange = (range: [Date, Date]) => {
        if (DateTime.now().hasSame(timerange[1], 'day')) {
            setLiveView(false);
        }
        setVisibleTimerange(clampRange(timerange, [DateTime.fromJSDate(range[0]), DateTime.fromJSDate(range[1])]));
    };

    const handleBrush = (domain: { y: [Date, Date] }) => {
        Logger.debug('Selected with brush:', domain.y);

        changeVisibleTimerange(domain.y);
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

    const handleBrushDebounced = debounce(handleBrush, 300);

    const domain: ForAxes<DomainTuple> = {
        y: [timerange[0].toMillis(), timerange[1].toMillis()],
        x: xDomain,
    };

    return (
        <div ref={ref}>
            <VictoryChart
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
                        onBrushDomainChange={(domain) => {
                            // Convert domain.y from numbers to Dates before passing to handler
                            handleBrushDebounced({ y: [new Date(domain.y[0]), new Date(domain.y[1])] });
                        }}
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
