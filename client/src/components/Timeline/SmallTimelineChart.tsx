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
import { colorProp } from '../charts.utils';

import useDimensions from 'react-cool-dimensions';
import { ITrackItem } from '../../@types/ITrackItem';
import { TrackItemType } from '../../enum/TrackItemType';
import { clampRange } from '../PieCharts/MetricTiles.utils';
import { BrushHandle } from './BrushHandle';
import { CHART_PADDING, CHART_SCALE } from './timeline.constants';
import { getTrackItemOrderFn } from './timeline.utils';

const domainPaddingBrush: DomainPaddingPropType = { y: 35, x: 5 };

const brushChartBarStyle = (isDark: boolean): VictoryStyleInterface => ({
    data: {
        width: 7,
        fill: colorProp,
        stroke: isDark ? 'black' : 'white',
        strokeWidth: 0.5,
        fillOpacity: 1,
    },
});

const xDomain: DomainTuple = [1, 3];

const EMPTY_ARRAY: ITrackItem[] = [];

export const SmallTimelineChart = memo(() => {
    const { chartTheme } = useChartThemeState();

    const { observe, width } = useDimensions();

    const timerange = useStoreState((state) => state.timerange);
    const visibleTimerange = useStoreState((state) => state.visibleTimerange);
    const timeItems = useStoreState((state) => state.timeItems);
    const setVisibleTimerange = useStoreActions((actions) => actions.setVisibleTimerange);

    const changeVisibleTimerange = (range: [Date, Date]) => {
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

    const brushData = [...statusTrackItems, ...logTrackItems];

    const handleBrushDebounced = debounce(handleBrush, 300);

    const domain: ForAxes<DomainTuple> = {
        y: [timerange[0].toMillis(), timerange[1].toMillis()],
        x: xDomain,
    };

    return (
        <div ref={observe}>
            <VictoryChart
                theme={chartTheme}
                height={50}
                width={width}
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
                        onBrushDomainChange={handleBrushDebounced}
                    />
                }
            >
                <VictoryAxis dependentAxis tickCount={20} />

                <VictoryBar
                    animate={false}
                    style={brushChartBarStyle(chartTheme.isDark)}
                    x={getTrackItemOrderFn}
                    y={(d) => d.beginDate}
                    y0={(d) => d.endDate}
                    data={brushData}
                />
            </VictoryChart>
        </div>
    );
});
