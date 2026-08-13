import { asc, eq } from 'drizzle-orm';
import { Matter, matters, NewMatter } from '../../legalAid.schema';
import { db } from '../db';

const logger = console;

export interface MatterInput {
    caseReference: string;
    clientName: string;
    keywords: string[];
    color?: string;
    archived?: boolean;
}

function toNewMatter(input: MatterInput): Omit<NewMatter, 'createdAt' | 'updatedAt'> {
    return {
        caseReference: input.caseReference.trim(),
        clientName: input.clientName.trim(),
        keywords: JSON.stringify(input.keywords || []),
        color: input.color,
        archived: input.archived || false,
    };
}

async function findAllMatters(): Promise<Matter[]> {
    return db.select().from(matters).orderBy(asc(matters.caseReference));
}

async function createMatter(input: MatterInput): Promise<Matter> {
    logger.debug('Creating matter:', input);

    const now = Date.now();
    const result = await db
        .insert(matters)
        .values({ ...toNewMatter(input), createdAt: now, updatedAt: now })
        .returning();

    return result[0]!;
}

async function updateMatter(id: number, input: MatterInput): Promise<Matter | null> {
    logger.debug('Updating matter:', id, input);

    const result = await db
        .update(matters)
        .set({ ...toNewMatter(input), updatedAt: Date.now() })
        .where(eq(matters.id, id))
        .returning();

    return result[0] || null;
}

async function deleteMatter(id: number): Promise<number> {
    logger.debug('Deleting matter:', id);

    await db.delete(matters).where(eq(matters.id, id));
    return id;
}

export const matterService = {
    findAllMatters,
    createMatter,
    updateMatter,
    deleteMatter,
};

export type MatterService = typeof matterService;
