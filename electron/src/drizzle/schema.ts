import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const trackItems = sqliteTable('TrackItems', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    app: text('app'),
    taskName: text('taskName'),
    title: text('title'),
    url: text('url'),
    color: text('color'),
    beginDate: integer('beginDate').notNull(),
    endDate: integer('endDate').notNull(),
    // beginDate and endDate are timestamp_ms= 1741535559759, but FE, it is easier to use timestamp than Date
});

export const appSettings = sqliteTable('AppSettings', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name'),
    color: text('color'),
});

export const settings = sqliteTable('Settings', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name'),
    jsonData: text('jsonData'),
});

export type TrackItem = typeof trackItems.$inferSelect;
export type NewTrackItem = typeof trackItems.$inferInsert;

export type AppSetting = typeof appSettings.$inferSelect;
export type NewAppSetting = typeof appSettings.$inferInsert;

export type Setting = typeof settings.$inferSelect;
export type NewSetting = typeof settings.$inferInsert;
