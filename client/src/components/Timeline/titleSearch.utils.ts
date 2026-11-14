import { DateTime } from 'luxon';
import { CallbackArgs, NumberOrCallback, StringOrCallback } from 'victory';
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

const HIGHLIGHT_STROKE = { light: '#d97706', dark: '#fbbf24' };
const DIMMED_FILL = { light: '#cbd5e0', dark: '#4a5568' };

interface BarStyleBase {
    isDark: boolean;
    stroke: string;
    strokeWidth: number;
}

/**
 * Victory bar `data` style for the timeline while a title search is active: non-matching bars turn grey,
 * matching bars keep their colour and get a thick outline, which also keeps very short items visible.
 */
export const titleHighlightBarStyle = (keyword: string, { isDark, stroke, strokeWidth }: BarStyleBase) => {
    const theme = isDark ? 'dark' : 'light';
    const isMatch = ({ datum }: CallbackArgs) => !keyword || matchesTitleKeyword(datum ?? {}, keyword);

    return {
        fill: ((args) => (isMatch(args) ? (args.datum?.color ?? '') : DIMMED_FILL[theme])) satisfies StringOrCallback,
        fillOpacity: ((args) => (isMatch(args) || !keyword ? 1 : 0.6)) satisfies NumberOrCallback,
        stroke: ((args) => (keyword && isMatch(args) ? HIGHLIGHT_STROKE[theme] : stroke)) satisfies StringOrCallback,
        strokeWidth: ((args) => (keyword && isMatch(args) ? 2 : strokeWidth)) satisfies NumberOrCallback,
    };
};

/** Draw matching items last so their outlines aren't covered by neighbouring bars. */
export const matchesLast = <T extends Pick<ITrackItem, 'title'>>(items: T[], keyword: string) =>
    keyword
        ? [
              ...items.filter((item) => !matchesTitleKeyword(item, keyword)),
              ...items.filter((item) => matchesTitleKeyword(item, keyword)),
          ]
        : items;
