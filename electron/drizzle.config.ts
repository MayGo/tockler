import { defineConfig } from 'drizzle-kit';
import * as os from 'os';
import path from 'path';
let userDir = `/Users/${os.userInfo().username}/Library/Application Support/Electron`;

export default defineConfig({
    schema: './src/drizzle/schema.ts',
    out: './src/drizzle/migrations',
    dialect: 'sqlite',
    dbCredentials: {
        url: path.join(userDir, 'tracker.db'),
    },
} as any);
