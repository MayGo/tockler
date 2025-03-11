import { afterEach, describe, expect, it, vi } from 'vitest';
import { db } from '../src/drizzle/db';
import { appSettingService } from '../src/services/app-setting-service';

// Mock the drizzle db
vi.mock('../src/drizzle/db', () => ({
    db: {
        select: vi.fn(),
        insert: vi.fn().mockReturnThis(),
        values: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn(),
        from: vi.fn().mockReturnThis(),
    },
}));

// Mock randomcolor
vi.mock('randomcolor', () => ({
    default: vi.fn().mockReturnValue('#123456'),
}));

describe('getAppColor', () => {
    afterEach(() => {
        vi.clearAllMocks();
        // Clear the cache
        appSettingService.cache = {};
    });

    it('returns new color, when there is nothing defined for given app name.', async () => {
        let appName = 'SOMEAPP2';

        // Mock db.select().from().where() to return empty array
        vi.mocked(db.select().from().where).mockResolvedValueOnce([]);

        // Mock db.insert().values().returning() for the creation
        vi.mocked(db.insert().values().returning).mockResolvedValueOnce([{ id: 1, name: appName, color: '#123456' }]);

        const color = await appSettingService.getAppColor(appName);

        expect(color).toContain('#');
    });

    it('returns already defined color.', async () => {
        let appName = 'SOMEAPP2';
        let appColor = '#000';

        // Mock db.select().from().where() to return a result
        vi.mocked(db.select().from().where).mockResolvedValueOnce([{ id: 1, name: appName, color: appColor }]);

        const color = await appSettingService.getAppColor(appName);

        expect(color).toEqual(appColor);
    });
});
