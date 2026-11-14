import { DateTime } from 'luxon';
import { ITrackItem } from '../../@types/ITrackItem';
import { sumApp } from './MetricTiles.utils';

/**
 * Measures the rendered width of arbitrary text given the font size and font face
 * @param {string} text The text to measure
 * @param {number} fontSize The font size in pixels
 * @param {string} fontFace The font face ("Arial", "Helvetica", etc.)
 * @returns {number} The width of the text
 * */
export function getTextWidth(text, fontSize, fontFace) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) {
        console.warn('No 2d context');
        return 0;
    }
    context.font = `${fontSize}px ${fontFace}`;
    return context.measureText(text).width;
}

export interface UsageBar {
    name: string;
    color: string;
    timeDiffInMs: number;
}

export interface UsageGroup {
    name: string;
    color: string | null | undefined;
}

export const UNCATEGORIZED: UsageGroup = { name: 'Uncategorized', color: '#cccccc' };

const FALLBACK_COLOR = '#cccccc';

/** Total time per group inside `range`, items clamped to the range, largest first. */
export const getUsageBars = (
    items: ITrackItem[],
    range: DateTime[],
    getGroup: (item: ITrackItem) => UsageGroup,
): UsageBar[] => {
    const addTime = sumApp(range);
    const bars = new Map<string, UsageBar>();

    for (const item of items) {
        const { name, color } = getGroup(item);
        const bar = bars.get(name) ?? { name, color: color || FALLBACK_COLOR, timeDiffInMs: 0 };
        bar.timeDiffInMs = addTime(bar.timeDiffInMs, item);
        bars.set(name, bar);
    }

    return [...bars.values()].filter((bar) => bar.timeDiffInMs > 0).sort((a, b) => b.timeDiffInMs - a.timeDiffInMs);
};
