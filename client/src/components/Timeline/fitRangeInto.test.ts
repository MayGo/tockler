import { DateTime } from 'luxon';
import { describe, expect, it } from 'vitest';
import { fitRangeInto } from './timeline.utils';

const at = (time: string) => DateTime.fromISO(`2026-11-14T${time}`);
const day = [at('00:00:00'), at('23:59:59.999')];
const fmt = (range: DateTime[]) => range.map((d) => d.toFormat('HH:mm'));

describe('fitRangeInto', () => {
    it('keeps a range that already fits', () => {
        expect(fmt(fitRangeInto(day, [at('09:00'), at('12:00')]))).toEqual(['09:00', '12:00']);
    });

    it('shifts a range that starts before the day, keeping its length', () => {
        expect(fmt(fitRangeInto(day, [at('00:00').minus({ hours: 2 }), at('04:00')]))).toEqual(['00:00', '06:00']);
    });

    it('shifts a range that ends after the day, keeping its length', () => {
        expect(fmt(fitRangeInto(day, [at('20:00'), at('20:00').plus({ hours: 6 })]))).toEqual(['17:59', '23:59']);
    });

    it('caps the length at the whole day', () => {
        expect(fmt(fitRangeInto(day, [at('06:00').minus({ hours: 6 }), at('06:00').plus({ hours: 30 })]))).toEqual([
            '00:00',
            '23:59',
        ]);
    });

    it('turns an inverted or empty range into a 5 minute one', () => {
        expect(fmt(fitRangeInto(day, [at('10:00'), at('09:00')]))).toEqual(['10:00', '10:05']);
        expect(fmt(fitRangeInto(day, [at('23:59'), at('23:59')]))).toEqual(['23:54', '23:59']);
    });
});
