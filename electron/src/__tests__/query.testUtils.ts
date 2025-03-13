import { asc, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/libsql';
import { TrackItem, trackItems } from '../drizzle/schema';

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
