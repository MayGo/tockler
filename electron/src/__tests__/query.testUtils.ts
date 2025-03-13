import { asc, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/libsql';
import { TrackItem, trackItems } from '../drizzle/schema';
import { State } from '../enums/state';
import { wait } from './time.testUtils';

export async function selectAppItem(db: ReturnType<typeof drizzle>, app: string) {
    return db.select().from(trackItems).where(eq(trackItems.app, app)).orderBy(asc(trackItems.beginDate)).execute();
}

export async function selectAllAppItems(db: ReturnType<typeof drizzle>) {
    return db.select().from(trackItems).execute();
}

export const expectNrOfItems = async (nr: number, db: ReturnType<typeof drizzle>) => {
    let items: TrackItem[] = [];

    await vi.waitFor(async () => {
        items = await selectAllAppItems(db);
        expect(items.length).toBe(nr);
    });

    return items;
};

export async function changeStateAndWait(appEmitter: any, state: State, timestamp: number) {
    await wait(100);
    vi.spyOn(Date, 'now').mockImplementation(() => timestamp);

    await appEmitter.emit('state-changed', state);

    // Give time for async operations to complete
    await wait(100);
}
