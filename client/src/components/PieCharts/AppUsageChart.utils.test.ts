import { DateTime } from 'luxon';
import { describe, expect, it } from 'vitest';
import { getUsageBars, UNCATEGORIZED } from './AppUsageChart.utils';

const at = (time: string) => DateTime.fromISO(`2021-06-19T${time}:00.000Z`).toMillis();
const MINUTE = 60 * 1000;

const item = (id: number, app: string, begin: string, end: string, color = '#111111') => ({
    id,
    app,
    color,
    beginDate: at(begin),
    endDate: at(end),
});

const range = [DateTime.fromMillis(at('10:00')), DateTime.fromMillis(at('12:00'))];

describe('getUsageBars', () => {
    it('sums time per app, largest first', () => {
        const items = [
            item(1, 'Code', '10:00', '10:10'),
            item(2, 'Chrome', '10:10', '10:40'),
            item(3, 'Code', '11:00', '11:05'),
        ];

        const bars = getUsageBars(items, range, (i) => ({ name: i.app, color: i.color }));

        expect(bars.map((b) => [b.name, b.timeDiffInMs])).toEqual([
            ['Chrome', 30 * MINUTE],
            ['Code', 15 * MINUTE],
        ]);
    });

    it('clamps items to the range and drops groups with no time in it', () => {
        const items = [
            item(1, 'Code', '09:50', '10:05'),
            item(2, 'Slack', '08:00', '09:00'),
            item(3, 'Chrome', '11:55', '12:30'),
        ];

        const bars = getUsageBars(items, range, (i) => ({ name: i.app, color: i.color }));

        expect(bars.map((b) => [b.name, b.timeDiffInMs])).toEqual([
            ['Code', 5 * MINUTE],
            ['Chrome', 5 * MINUTE],
        ]);
    });

    it('groups by category and falls back to Uncategorized', () => {
        const categoryByApp = new Map([['Code', { name: 'Work', color: '#db0000' }]]);
        const items = [item(1, 'Code', '10:00', '10:20'), item(2, 'Chrome', '10:20', '10:30')];

        const bars = getUsageBars(items, range, (i) => categoryByApp.get(i.app) ?? UNCATEGORIZED);

        expect(bars).toEqual([
            { name: 'Work', color: '#db0000', timeDiffInMs: 20 * MINUTE },
            { name: 'Uncategorized', color: '#cccccc', timeDiffInMs: 10 * MINUTE },
        ]);
    });
});
