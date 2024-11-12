import React, { memo } from 'react';
import { filterItems } from '../Timeline/timeline.utils';
import _ from 'lodash';
import { useStoreState } from '../../store/easyPeasy';
import { VictoryBar, VictoryLabel, VictoryStack } from 'victory';
import useDimensions from 'react-cool-dimensions';
import { BAR_WIDTH } from '../Timeline/timeline.constants';
import { sumAppObject } from './MetricTiles.utils';

import moment from 'moment';
import { useChartThemeState } from '../../routes/ChartThemeProvider';
import { BarWithTooltip } from '../Timeline/BarWithTooltip';
import { colorProp } from '../charts.utils';
import { secondsToClock } from '../../time.util';
import { getTextWidth } from './AppUsageChart.utils';

export const AppUsageChart = memo(() => {
    const { observe, width } = useDimensions();
    const { chartTheme } = useChartThemeState();
    const timeItems = useStoreState((state) => state.timeItems);
    const visibleTimerange = useStoreState((state) => state.visibleTimerange);

    const appItems = filterItems(timeItems.appItems, visibleTimerange);

    const groupByField = 'app';

    const data = _(appItems)
        .groupBy(groupByField)
        .map((b) => {
            return b.reduce(sumAppObject(visibleTimerange), {
                app: b[0].app,
                title: b[0].title,
                timeDiffInMs: 0,
                color: b[0].color,
            });
        })
        .sortBy('timeDiffInMs')
        .reverse()
        .valueOf();

    const getTooltipLabel = (datum) => {
        const dur = moment.duration(datum.timeDiffInMs).asSeconds();

        return `${datum[groupByField]}\r\n${secondsToClock(dur)}`;
    };

    const style: any = {
        data: {
            fill: colorProp,
            stroke: colorProp,
            strokeWidth: 0.5,
            fillOpacity: 0.75,
        },
    };

    const labelPadding = 25;
    return (
        <div ref={observe}>
            <VictoryStack height={BAR_WIDTH} padding={0} width={width} horizontal>
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
                                    const dur = moment.duration(datum.timeDiffInMs).asSeconds();

                                    const text = `${datum.app} - ${secondsToClock(dur)}`;
                                    const textWidth = getTextWidth(
                                        text,
                                        14,
                                        '"Gill Sans", Seravek, "Trebuchet MS", sans-serif;',
                                    );

                                    const timeDiff = datum._y1 - datum._y0;

                                    // @ts-ignore
                                    const width = scale?.y ? scale.y(timeDiff) : 0;
                                    const canFit = textWidth + labelPadding * 2 < width;
                                    // @ts-ignore
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
