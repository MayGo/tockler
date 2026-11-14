import { eq } from 'drizzle-orm';
import { categories, NewCategory } from '../../schema';
import { db } from '../db';

export const getCategories = async () => {
    return db.query.categories.findMany();
};

export const createCategory = async (category: NewCategory) => {
    return db.insert(categories).values(category).returning();
};

export const updateCategory = async (id: number, category: Partial<NewCategory>) => {
    return db.update(categories).set(category).where(eq(categories.id, id)).returning();
};

export const deleteCategory = async (id: number) => {
    return db.delete(categories).where(eq(categories.id, id)).returning();
};

export const categoryService = {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
};

export type CategoryService = typeof categoryService;
