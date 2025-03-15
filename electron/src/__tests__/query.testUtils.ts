import { asc, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/libsql';
import { trackItems } from '../drizzle/schema';
import { State } from '../enums/state';
import { wait } from './time.testUtils';

export async function selectAppItem(db: ReturnType<typeof drizzle>, app: string) {
    return db.select().from(trackItems).where(eq(trackItems.app, app)).orderBy(asc(trackItems.beginDate)).execute();
}

export async function selectAllAppItems(db: ReturnType<typeof drizzle>) {
    return db.select().from(trackItems).execute();
}

export async function changeStateAndMockDate(appEmitter: any, state: State, timestamp: number) {
    vi.spyOn(Date, 'now').mockImplementation(() => timestamp);
    await appEmitter.emit('state-changed', state);

    await wait(100);
}
