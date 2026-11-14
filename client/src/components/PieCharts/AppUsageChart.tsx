import { memo, useEffect, useMemo, useState } from 'react';

import { Button, ButtonGroup } from '@chakra-ui/react';
import { useMeasure } from '@uidotdev/usehooks';
import { VictoryBar, VictoryLabel, VictoryStack, VictoryStyleInterface } from 'victory';
import { ITrackItem } from '../../@types/ITrackItem';
import { TrackItemType } from '../../enum/TrackItemType';
import { Logger } from '../../logger';
import { useChartThemeState } from '../../routes/ChartThemeProvider';
import { useStoreActions, useStoreState } from '../../store/easyPeasy';
import { formatDurationInternal } from '../../utils';
import { BarWithTooltip } from '../Timeline/BarWithTooltip';
import { BAR_WIDTH } from '../Timeline/timeline.constants';
import { colorProp } from '../charts.utils';
import { getTextWidth, getUsageBars, UNCATEGORIZED } from './AppUsageChart.utils';

type ViewMode = 'app' | 'category';

const EMPTY_ARRAY: ITrackItem[] = [];

const LABEL_PADDING = 25;
const LABEL_FONT = '"Gill Sans", Seravek, "Trebuchet MS", sans-serif;';

export const AppUsageChart = memo(() => {
    const [ref, { width }] = useMeasure();
    const { chartTheme } = useChartThemeState();
    const visibleTimerange = useStoreState((state) => state.visibleTimerange);
    const appItems = useStoreState((state) => state.timeItems[TrackItemType.AppTrackItem]) || EMPTY_ARRAY;
    const appSettings = useStoreState((state) => state.appSettings);
    const fetchAppSettings = useStoreActions((actions) => actions.fetchAppSettings);
    const [viewMode, setViewMode] = useState<ViewMode>('app');

    useEffect(() => {
        if (viewMode === 'category') {
            fetchAppSettings().catch((error) => Logger.error('Failed to load app categories', error));
        }
    }, [viewMode, fetchAppSettings]);

    const categoryByApp = useMemo(
        () => new Map(appSettings.map((setting) => [setting.name, setting.category])),
        [appSettings],
    );

    const bars = useMemo(
        () =>
            getUsageBars(appItems, visibleTimerange, (item) =>
                viewMode === 'app'
                    ? { name: item.app, color: item.color }
                    : (categoryByApp.get(item.app) ?? UNCATEGORIZED),
            ),
        [appItems, visibleTimerange, viewMode, categoryByApp],
    );

    // Victory renders `datum.label` as is, and renders nothing for null. An empty string would still
    // produce a <text> element with a NaN position.
    const data = useMemo(() => {
        const totalMs = bars.reduce((sum, bar) => sum + bar.timeDiffInMs, 0);
        return bars.map((bar) => {
            const text = `${bar.name} - ${formatDurationInternal(bar.timeDiffInMs)}`;
            const barWidthPx = totalMs > 0 ? (bar.timeDiffInMs / totalMs) * (width ?? 0) : 0;
            const canFit = getTextWidth(text, 14, LABEL_FONT) + LABEL_PADDING * 2 < barWidthPx;
            return { ...bar, label: canFit ? text : null };
        });
    }, [bars, width]);

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
                        labelComponent={
                            <VictoryLabel verticalAnchor="end" textAnchor="end" dx={-LABEL_PADDING} dy={-5} />
                        }
                        dataComponent={<BarWithTooltip theme={chartTheme} getTooltipLabel={getTooltipLabel} />}
                    />
                ))}
            </VictoryStack>
        </div>
    );
});
