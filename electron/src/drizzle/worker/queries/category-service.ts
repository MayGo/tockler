import { eq } from 'drizzle-orm';
import { appSettings, categories, NewCategory } from '../../schema';
import { db } from '../db';

export const getCategories = async () => {
    return db.query.categories.findMany();
};

export const createCategory = async (category: NewCategory) => {
    const [created] = await db.insert(categories).values(category).returning();
    return created;
};

export const updateCategory = async (id: number, category: Partial<NewCategory>) => {
    const [updated] = await db.update(categories).set(category).where(eq(categories.id, id)).returning();
    return updated;
};

export const deleteCategory = async (id: number) => {
    // The FK clears categoryId on delete, but databases that ran an earlier draft of migration 0001
    // have the FK without ON DELETE SET NULL, so clear it explicitly.
    db.transaction((tx) => {
        tx.update(appSettings).set({ categoryId: null }).where(eq(appSettings.categoryId, id)).run();
        tx.delete(categories).where(eq(categories.id, id)).run();
    });
};

export const categoryService = {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
};

export type CategoryService = typeof categoryService;
