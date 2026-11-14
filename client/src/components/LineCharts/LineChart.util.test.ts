import { describe, expect, it } from 'vitest';
import { formatToHours, onlineAxisTicks } from './LineChart.util';

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

describe('formatToHours', () => {
    it('labels in hours when the busiest day is an hour or more', () => {
        const format = formatToHours(8 * HOUR);
        expect([0, 0.25, 0.5, 1].map(format)).toEqual(['0 h', '2 h', '4 h', '8 h']);
        expect(formatToHours(5 * HOUR)(0.25)).toBe('1.3 h');
    });

    it('labels in minutes when every day is under an hour', () => {
        expect([0, 0.5, 1].map(formatToHours(10 * MINUTE))).toEqual(['0 m', '5 m', '10 m']);
    });

    it('returns no label when there is no data', () => {
        expect(formatToHours(-Infinity)(0.5)).toBe('');
        expect(formatToHours(0)(0.5)).toBe('');
    });
});

describe('onlineAxisTicks', () => {
    const labels = (max: number) => onlineAxisTicks(max).map(formatToHours(max));

    it('puts ticks on round hours', () => {
        expect(labels(9.8 * HOUR)).toEqual(['2 h', '4 h', '6 h', '8 h']);
        expect(labels(3 * HOUR)).toEqual(['1 h', '2 h', '3 h']);
    });

    it('puts ticks on round minutes for short days', () => {
        expect(labels(11 * MINUTE)).toEqual(['5 m', '10 m']);
        expect(labels(40 * MINUTE)).toEqual(['10 m', '20 m', '30 m', '40 m']);
    });

    it('has no ticks without data', () => {
        expect(onlineAxisTicks(-Infinity)).toEqual([]);
    });
});
