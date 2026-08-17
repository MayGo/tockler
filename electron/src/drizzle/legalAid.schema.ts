import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { trackItems } from './schema';

// Fork-specific tables for the legal aid time-recording MVP.
// Kept isolated from the upstream schema.ts tables (TrackItems, AppSettings, Settings)
// so it's clear at a glance what's fork-specific vs. upstream Tockler.

export const matters = sqliteTable(
    'Matters',
    {
        id: integer('id').primaryKey({ autoIncrement: true }),
        caseReference: text('caseReference').notNull(),
        clientName: text('clientName').notNull(),
        // JSON-encoded string[] of extra keywords/aliases to match against, beyond caseReference
        keywords: text('keywords'),
        color: text('color'),
        archived: integer('archived', { mode: 'boolean' }).notNull().default(false),
        createdAt: integer('createdAt').notNull(),
        updatedAt: integer('updatedAt').notNull(),
    },
    (table) => {
        return {
            caseReferenceIdx: uniqueIndex('matters_case_reference').on(table.caseReference),
        };
    },
);

export const matterTags = sqliteTable(
    'MatterTags',
    {
        id: integer('id').primaryKey({ autoIncrement: true }),
        // One tag row per TrackItem so re-running the matcher updates in place instead of duplicating.
        trackItemId: integer('trackItemId')
            .notNull()
            .references(() => trackItems.id, { onDelete: 'cascade' }),
        // Null matterId = reviewed and confirmed unmatched (see matchType) or not yet matched to anything.
        matterId: integer('matterId').references(() => matters.id, { onDelete: 'set null' }),
        matchedText: text('matchedText'),
        // 'caseRef' | 'keyword' | 'manual' | 'none' — see enums/matter-match-type.ts
        matchType: text('matchType').notNull(),
        createdAt: integer('createdAt').notNull(),
        updatedAt: integer('updatedAt').notNull(),
    },
    (table) => {
        return {
            trackItemIdx: uniqueIndex('matter_tags_track_item_id').on(table.trackItemId),
            matterIdx: index('matter_tags_matter_id').on(table.matterId),
        };
    },
);

export type Matter = typeof matters.$inferSelect;
export type NewMatter = typeof matters.$inferInsert;

export type MatterTag = typeof matterTags.$inferSelect;
export type NewMatterTag = typeof matterTags.$inferInsert;
