import _ from 'lodash';
import { memo } from 'react';

import { useMeasure } from '@uidotdev/usehooks';
import { VictoryBar, VictoryLabel, VictoryStack, VictoryStyleInterface } from 'victory';
import { useStoreState } from '../../store/easyPeasy';
import { BAR_WIDTH } from '../Timeline/timeline.constants';
import { filterItems } from '../Timeline/timeline.utils';
import { sumAppObject, SumItem } from './MetricTiles.utils';

import { TrackItemType } from '../../enum/TrackItemType';
import { useChartThemeState } from '../../routes/ChartThemeProvider';
import { formatDurationInternal } from '../../utils';
import { BarWithTooltip } from '../Timeline/BarWithTooltip';
import { colorProp } from '../charts.utils';
import { getTextWidth } from './AppUsageChart.utils';

export const AppUsageChart = memo(() => {
    const [ref, { width }] = useMeasure();
    const { chartTheme } = useChartThemeState();
    const timeItems = useStoreState((state) => state.timeItems);
    const visibleTimerange = useStoreState((state) => state.visibleTimerange);

    const appItems = filterItems(timeItems[TrackItemType.AppTrackItem] || [], visibleTimerange);

    const groupByField = 'app';

    const data = _(appItems)
        .groupBy(groupByField)
        .map((b) => {
            return b.reduce(sumAppObject(visibleTimerange), {
                app: b[0].app,
                title: b[0].title,
                timeDiffInMs: 0,
                color: b[0].color,
            } as SumItem);
        })
        .sortBy('timeDiffInMs')
        .reverse()
        .valueOf();

    const getTooltipLabel = (datum) => {
        return `${datum[groupByField]}\r\n${formatDurationInternal(datum.timeDiffInMs)}`;
    };

    const style: VictoryStyleInterface = {
        data: {
            fill: colorProp,
            stroke: colorProp,
            strokeWidth: 0.5,
            fillOpacity: 0.75,
        },
    };

    const labelPadding = 25;
    return (
        <div ref={ref}>
            <VictoryStack height={BAR_WIDTH} padding={0} width={width ?? 0} horizontal>
                {data.map((item) => (
                    <VictoryBar
                        key={item.app}
                        style={style}
                        barWidth={BAR_WIDTH * 2}
                        data={[item]}
                        x="app"
                        y="timeDiffInMs"
                        labels={({ datum }) => datum.app}
                        labelComponent={
                            <VictoryLabel
                                verticalAnchor="end"
                                textAnchor="end"
                                text={({ datum, scale }) => {
                                    const text = `${datum.app} - ${formatDurationInternal(datum.timeDiffInMs)}`;
                                    const textWidth = getTextWidth(
                                        text,
                                        14,
                                        '"Gill Sans", Seravek, "Trebuchet MS", sans-serif;',
                                    );

                                    const timeDiff = datum._y1 - datum._y0;

                                    const width =
                                        typeof scale === 'object' && typeof scale.y === 'function'
                                            ? scale.y(timeDiff)
                                            : 0;

                                    const canFit = textWidth + labelPadding * 2 < width;

                                    return canFit ? text : '';
                                }}
                                dx={-labelPadding}
                                dy={-5}
                            />
                        }
                        dataComponent={<BarWithTooltip theme={chartTheme} getTooltipLabel={getTooltipLabel} />}
                    />
                ))}
            </VictoryStack>
        </div>
    );
});
