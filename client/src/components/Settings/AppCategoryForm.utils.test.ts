import { describe, expect, it } from 'vitest';
import { filterApps } from './AppCategoryForm.utils';

const apps = ['Code', 'ONLINE', 'Google Chrome', 'cursor', 'IDLE', 'Visual Studio Code', 'OFFLINE'].map((name) => ({
    name,
}));

describe('filterApps', () => {
    it('drops status rows and sorts by name', () => {
        expect(filterApps(apps, '').visible.map((a) => a.name)).toEqual([
            'Code',
            'cursor',
            'Google Chrome',
            'Visual Studio Code',
        ]);
    });

    it('filters case-insensitively by substring', () => {
        expect(filterApps(apps, '  CODE ').visible.map((a) => a.name)).toEqual(['Code', 'Visual Studio Code']);
    });

    it('limits the rendered rows but reports the full count', () => {
        expect(filterApps(apps, '', 2)).toEqual({ visible: [{ name: 'Code' }, { name: 'cursor' }], total: 4 });
    });
});
