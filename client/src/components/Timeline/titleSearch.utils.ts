import { DateTime } from 'luxon';
import { NumberOrCallback } from 'victory';
import { ITrackItem } from '../../@types/ITrackItem';

export const normalizeKeyword = (keyword: string) => keyword.trim().toLowerCase();

/** `keyword` must already be normalized with `normalizeKeyword`. */
export const matchesTitleKeyword = (item: Pick<ITrackItem, 'title'>, keyword: string) =>
    keyword.length > 0 && (item.title ?? '').toLowerCase().includes(keyword);

/**
 * Total time covered by `items` inside `range`, in ms.
 * Overlapping items (e.g. an app item and a task log at the same time) are counted once.
 */
export const getMergedDurationMs = (items: ITrackItem[], range: DateTime[]) => {
    const rangeBegin = range[0].toMillis();
    const rangeEnd = range[1].toMillis();

    const intervals = items
        .map((item) => [Math.max(item.beginDate, rangeBegin), Math.min(item.endDate, rangeEnd)] as const)
        .filter(([begin, end]) => end > begin)
        .sort((a, b) => a[0] - b[0]);

    let total = 0;
    let currentBegin: number | undefined;
    let currentEnd = 0;

    for (const [begin, end] of intervals) {
        if (currentBegin === undefined || begin > currentEnd) {
            if (currentBegin !== undefined) {
                total += currentEnd - currentBegin;
            }
            currentBegin = begin;
            currentEnd = end;
        } else {
            currentEnd = Math.max(currentEnd, end);
        }
    }

    if (currentBegin !== undefined) {
        total += currentEnd - currentBegin;
    }

    return total;
};

export const DIMMED_OPACITY = 0.15;

/** Victory `fillOpacity` callback: dims bars whose title doesn't match while a search is active. */
export const titleHighlightOpacity =
    (keyword: string): NumberOrCallback =>
    ({ datum }) =>
        !keyword || matchesTitleKeyword(datum ?? {}, keyword) ? 1 : DIMMED_OPACITY;
