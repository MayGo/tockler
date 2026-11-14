import { memo, useEffect, useState } from 'react';

import { Button, ButtonGroup } from '@chakra-ui/react';
import { useMeasure } from '@uidotdev/usehooks';
import { VictoryBar, VictoryLabel, VictoryStack, VictoryStyleInterface } from 'victory';
import { useChartThemeState } from '../../routes/ChartThemeProvider';
import { getAppUsageByApp, getAppUsageByCategory } from '../../services/trackItem.api';
import { useStoreState } from '../../store/easyPeasy';
import { formatDurationInternal } from '../../utils';
import { BarWithTooltip } from '../Timeline/BarWithTooltip';
import { BAR_WIDTH } from '../Timeline/timeline.constants';
import { colorProp } from '../charts.utils';
import { getTextWidth } from './AppUsageChart.utils';

type ViewMode = 'app' | 'category';

interface AppUsageData {
    name: string;
    color: string;
    timeDiffInMs: number;
}

export const AppUsageChart = memo(() => {
    const [ref, { width }] = useMeasure();
    const { chartTheme } = useChartThemeState();
    const visibleTimerange = useStoreState((state) => state.visibleTimerange);
    const [viewMode, setViewMode] = useState<ViewMode>('app');
    const [data, setData] = useState<AppUsageData[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            if (!visibleTimerange[0] || !visibleTimerange[1]) return;

            const from = visibleTimerange[0].toISO();
            const to = visibleTimerange[1].toISO();

            if (!from || !to) return;

            if (viewMode === 'app') {
                const appData = await getAppUsageByApp(from, to);
                setData(
                    appData.map((d) => ({
                        name: d.appName,
                        color: d.appColor || '#cccccc',
                        timeDiffInMs: d.totalDuration,
                    })),
                );
            } else {
                const categoryData = await getAppUsageByCategory(from, to);
                setData(
                    categoryData.map((d) => ({
                        name: d.categoryName,
                        color: d.categoryColor || '#cccccc',
                        timeDiffInMs: d.totalDuration,
                    })),
                );
            }
        };

        fetchData();
    }, [viewMode, visibleTimerange]);

    const getTooltipLabel = (datum) => {
        return `${datum.name}\r\n${formatDurationInternal(datum.timeDiffInMs)}`;
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
            <ButtonGroup size="sm" isAttached variant="outline" mb={4}>
                <Button onClick={() => setViewMode('app')} isActive={viewMode === 'app'}>
                    By App
                </Button>
                <Button onClick={() => setViewMode('category')} isActive={viewMode === 'category'}>
                    By Category
                </Button>
            </ButtonGroup>
            <VictoryStack height={BAR_WIDTH} padding={0} width={width ?? 0} horizontal>
                {data.map((item) => (
                    <VictoryBar
                        key={item.name}
                        style={style}
                        barWidth={BAR_WIDTH * 2}
                        data={[item]}
                        x="name"
                        y="timeDiffInMs"
                        labels={({ datum }) => datum.name}
                        labelComponent={
                            <VictoryLabel
                                verticalAnchor="end"
                                textAnchor="end"
                                text={({ datum, scale }) => {
                                    const text = `${datum.name} - ${formatDurationInternal(datum.timeDiffInMs)}`;
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
