// Todo: make match interface
export class WebpackMigrationSource {
    constructor(
        private migrationContext: __WebpackModuleApi.RequireContext,
        private shouldRunScript: (script: string) => boolean = () => true,
    ) {}

    /**
     * Gets the migration names
     * @returns Promise<string[]>
     */
    getMigrations() {
        const migrations = this.migrationContext.keys().filter(this.shouldRunScript).sort();

        return Promise.resolve(migrations);
    }

    getMigrationName(migration: string) {
        // Existing migrations were .js files, need to change name to match
        // what is in the database, otherwise we get a corrupted migration
        // error
        return `${migration.substring(2, migration.length - 3)}.js`;
    }

    getMigration(name: string) {
        return this.migrationContext(name);
    }
}
