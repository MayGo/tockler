import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { workerData } from 'worker_threads';
import * as schema from '../schema';

const outputPath = workerData.outputPath;

console.info('real db outputPath', outputPath);

// Create SQLite connection with performance optimizations
export const sqlite = new Database(outputPath, {
    verbose: process.env['NODE_ENV'] === 'development' ? console.log : undefined,
    // Add additional performance options
    timeout: 5000, // Increase timeout for busy database
});

// Apply performance optimizations
sqlite.pragma('journal_mode = WAL'); // Use Write-Ahead Logging for better concurrency
sqlite.pragma('synchronous = NORMAL'); // Reduce synchronous disk writes (balance between safety and speed)
sqlite.pragma('cache_size = -64000'); // 64MB page cache (negative means kibibytes)
sqlite.pragma('foreign_keys = ON'); // Ensure data integrity
sqlite.pragma('temp_store = MEMORY'); // Store temporary tables and indices in memory
sqlite.pragma('mmap_size = 1000000000'); // 1GB memory-mapped I/O (more reasonable for desktop applications)

// Additional performance optimizations
sqlite.pragma('page_size = 8192'); // Larger page size for better read performance (default is 4096)
sqlite.pragma('auto_vacuum = INCREMENTAL'); // Use incremental vacuum for better space management
sqlite.pragma('busy_timeout = 5000'); // Set busy timeout to prevent SQLITE_BUSY errors

export const db = drizzle(sqlite, { schema });
