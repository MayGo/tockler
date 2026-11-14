/** Status rows (online/offline/idle) live in AppSettings for their colours but are not apps. */
const STATUS_NAMES = new Set(['ONLINE', 'OFFLINE', 'IDLE']);

export const APP_LIST_LIMIT = 100;

/** Apps matching `query` (case-insensitive substring), sorted by name, at most `limit` of them. */
export const filterApps = <T extends { name: string }>(apps: T[], query: string, limit = APP_LIST_LIMIT) => {
    const needle = query.trim().toLowerCase();
    const matching = apps
        .filter((app) => !STATUS_NAMES.has(app.name))
        .filter((app) => app.name.toLowerCase().includes(needle))
        .sort((a, b) => a.name.localeCompare(b.name));

    return { visible: matching.slice(0, limit), total: matching.length };
};
