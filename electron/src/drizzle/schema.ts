import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const trackItems = sqliteTable(
    'TrackItems',
    {
        id: integer('id').primaryKey({ autoIncrement: true }),
        app: text('app').notNull(),
        taskName: text('taskName'),
        title: text('title'),
        url: text('url'),
        color: text('color'),
        beginDate: integer('beginDate').notNull(),
        endDate: integer('endDate').notNull(),
        // beginDate and endDate are timestamp_ms= 1741535559759, but FE, it is easier to use timestamp than Date
    },
    (table) => {
        return {
            appBeginDateIdx: index('track_items_begin_date').on(table.beginDate),
            appEndDateIdx: index('track_items_end_date').on(table.endDate),
            taskNameIdx: index('track_items_task_name').on(table.taskName),
        };
    },
);

export const appSettings = sqliteTable(
    'AppSettings',
    {
        id: integer('id').primaryKey({ autoIncrement: true }),
        name: text('name').notNull().unique(),
        color: text('color'),
    },
    (table) => {
        return {
            nameIdx: index('app_settings_name').on(table.name),
        };
    },
);

export const settings = sqliteTable(
    'Settings',
    {
        id: integer('id').primaryKey({ autoIncrement: true }),
        name: text('name').notNull().unique(),
        jsonData: text('jsonData'),
    },
    (table) => {
        return {
            nameIdx: index('settings_name').on(table.name),
        };
    },
);

export type TrackItem = typeof trackItems.$inferSelect;
export type NewTrackItem = typeof trackItems.$inferInsert;

export type AppSetting = typeof appSettings.$inferSelect;
export type NewAppSetting = typeof appSettings.$inferInsert;

export type Setting = typeof settings.$inferSelect;
export type NewSetting = typeof settings.$inferInsert;
