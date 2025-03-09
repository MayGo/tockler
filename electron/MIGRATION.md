# Migration from Knex/Objection to Drizzle ORM

This document describes the migration of the Tockler database layer from Knex/Objection to Drizzle ORM.

## Changes Made

1. Replaced dependencies:

    - Removed: `knex`, `objection`
    - Added: `drizzle-orm`, `drizzle-kit`, `better-sqlite3`

2. Created new Drizzle schema definitions:

    - Created `src/drizzle/schema.ts` with table definitions
    - Created type definitions for all models

3. Updated database connection:

    - Created `src/drizzle/db.ts` to handle database initialization
    - Added migration support

4. Updated services to use Drizzle:

    - `TrackItemService`
    - `AppSettingService`
    - `SettingsService`

5. Added Drizzle-specific commands:

    - `db:generate` - Generate migrations
    - `db:push` - Apply schema changes
    - `db:studio` - Launch Drizzle Studio
    - `db:migrate` - Run migrations

6. Removed old Objection/Knex files:
    - Deleted model files:
        - `src/models/TrackItem.ts`
        - `src/models/Setting.ts`
        - `src/models/AppSetting.ts`
        - `src/models/db.ts`
        - `src/models/WebpackMigrationSource.ts`
    - Backed up and removed old migrations in `migrations/` directory
    - Updated `app-manager.ts` to use Drizzle instead of Knex

## Using the New Database Layer

### Setup

```bash
pnpm run setup
```

### Database Commands

Generate migrations from schema changes:

```bash
pnpm run db:generate
npx drizzle-kit generate
```

Apply schema changes directly to the database:

```bash
pnpm run db:push
```

View and manage database with Drizzle Studio:

```bash
pnpm run db:studio
```

Run database migrations:

```bash
pnpm run db:migrate
```

## Database Schema

The database schema has been preserved during migration:

1. `TrackItems` - Stores tracking data for applications and activities

    - `id` - Primary key
    - `app` - Application name
    - `taskName` - Type of tracking item
    - `title` - Title/description
    - `url` - URL (if applicable)
    - `color` - Display color
    - `beginDate` - Start time
    - `endDate` - End time

2. `AppSettings` - Application settings and colors

    - `id` - Primary key
    - `name` - Setting name
    - `color` - Color value

3. `Settings` - General application settings
    - `id` - Primary key
    - `name` - Setting name
    - `jsonData` - JSON data stored as text

## Benefits of Drizzle

-   Type safety with automatically generated types
-   Better performance with direct SQLite access
-   More modern and maintained codebase
-   Built-in migration tools
-   Drizzle Studio for database visualization
