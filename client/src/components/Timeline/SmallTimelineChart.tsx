import { memo } from 'react';
import { debounce } from 'lodash';
import moment from 'moment';
import { VictoryAxis, VictoryBar, VictoryBrushContainer, VictoryChart } from 'victory';

import { Logger } from '../../logger';

import { colorProp } from '../charts.utils';
import { useChartThemeState } from '../../routes/ChartThemeProvider';
import { useStoreActions, useStoreState } from '../../store/easyPeasy';
import { rangeToDate } from '../../timeline.util';

import { BrushHandle } from './BrushHandle';
import { getTrackItemOrderFn } from './timeline.utils';
import { CHART_PADDING, CHART_SCALE } from './timeline.constants';
import useDimensions from 'react-cool-dimensions';
import { clampRange } from '../PieCharts/MetricTiles.utils';

const domainPaddingBrush: any = { y: 35, x: 5 };

const brushChartBarStyle: any = (isDark) => ({
    data: {
        width: 7,
        fill: colorProp,
        stroke: isDark ? 'black' : 'white',
        strokeWidth: 0.5,
        fillOpacity: 1,
    },
});

const xDomain: [number, number] = [1, 3];

export const SmallTimelineChart = memo(() => {
    const { chartTheme } = useChartThemeState();

    const { observe, width } = useDimensions();

    const timerange = useStoreState((state) => state.timerange);
    const visibleTimerange = useStoreState((state) => state.visibleTimerange);
    const timeItems = useStoreState((state) => state.timeItems);
    const setVisibleTimerange = useStoreActions((actions) => actions.setVisibleTimerange);

    const changeVisibleTimerange = (range) => {
        setVisibleTimerange(clampRange(timerange, [moment(range[0]), moment(range[1])]));
    };

    const handleBrush = (domain) => {
        Logger.debug('Selected with brush:', domain.y);

        changeVisibleTimerange(domain.y);
    };

    const { appItems, logItems, statusItems } = timeItems;

    if (!timerange && !appItems && appItems.length === 0) {
        return <div>No data</div>;
    }

    let brushData = [...statusItems, ...logItems];

    const handleBrushDebounced = debounce(handleBrush, 300);

    const domain: any = {
        y: [timerange[0], timerange[1]],
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
                        handleComponent={<BrushHandle viewBox="-0.5 -2 8 30" />}
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
