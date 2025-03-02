import { useEffect, useState } from 'react';
import { VictoryBrushLine } from 'victory';
import { convertDate } from '../../constants';
import { TrackItemType } from '../../enum/TrackItemType';
import { Logger } from '../../logger';

import { useDebouncedCallback } from 'use-debounce';
import { useChartThemeState } from '../../routes/ChartThemeProvider';
import { useStoreActions, useStoreState } from '../../store/easyPeasy';
import { BrushHandle } from './BrushHandle';
import { BAR_WIDTH } from './timeline.constants';

/**
 * The MainBrushLine is a custom grid component for VictoryAxis
 * It renders a brush line that can be used to edit the selected timeline item
 *
 * When used as a gridComponent in VictoryAxis, it receives several props:
 * - x, y: positioning coordinates
 * - scale: the scale used by the parent chart
 * - index, datum, tick, active: metadata about the current grid line
 */
export const MainBrushLine = (props) => {
    const { chartTheme } = useChartThemeState();
    const selectedTimelineItem = useStoreState((state) => state.selectedTimelineItem);
    const setSelectedTimelineItem = useStoreActions((actions) => actions.setSelectedTimelineItem);

    // Add a forceRefresh state to trigger brush re-rendering
    const [forceRefresh, setForceRefresh] = useState(0);

    console.info('MainBrushLine......props', props);
    console.info('MainBrushLine......selectedTimelineItem', selectedTimelineItem);

    // Effect to trigger refresh when selectedTimelineItem changes
    useEffect(() => {
        // Increment the force refresh counter to generate a new key
        setForceRefresh((prev) => prev + 1);
    }, [selectedTimelineItem?.id]); // Only trigger on ID change to avoid loops

    // Handle brush domain changes
    const handleEditBrush = useDebouncedCallback((domain, brushProps) => {
        console.info('MainBrushLine......domain', domain);
        if (domain && selectedTimelineItem?.id) {
            console.info('EditBrush event received:', domain, brushProps);

            const beginDate = convertDate(domain[0]).valueOf();
            const endDate = convertDate(domain[1]).valueOf();

            Logger.debug('EditBrush changed:', beginDate, endDate);
            setSelectedTimelineItem({ ...selectedTimelineItem, beginDate, endDate });
        }
    }, 200);

    // Don't render brush for non-log items or if no item is selected
    const shouldRenderBrush = selectedTimelineItem && selectedTimelineItem.taskName === TrackItemType.LogTrackItem;

    if (!shouldRenderBrush) {
        return null; // Don't render anything if we don't have a valid item
    }

    // Get current domain values from the selectedTimelineItem
    const brushDomain = [
        selectedTimelineItem ? selectedTimelineItem.beginDate : 0,
        selectedTimelineItem ? selectedTimelineItem.endDate : 0,
    ];

    return (
        <VictoryBrushLine
            {...props}
            // Add a key prop that changes when we need to force refresh
            key={`brush-${selectedTimelineItem.id}-${forceRefresh}`}
            disable={!selectedTimelineItem || selectedTimelineItem.taskName !== TrackItemType.LogTrackItem}
            width={BAR_WIDTH}
            height={100}
            y={3}
            horizontal={true}
            brushWidth={BAR_WIDTH}
            dimension="x"
            brushDomain={brushDomain}
            onBrushDomainChange={handleEditBrush}
            brushStyle={{
                fill: chartTheme.isDark ? '#7C3AED' : '#A78BFA',
                opacity: 0.5,
                cursor: 'move',
                strokeWidth: 1.5,
                pointerEvents: 'all',
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
    );
};
