import { ICategory, NewCategory } from '../@types/ICategory';
import { ElectronEventEmitter } from './ElectronEventEmitter';

export async function getCategories(): Promise<ICategory[]> {
    return ElectronEventEmitter.emitOrThrow('getCategories');
}

export async function createCategory(category: NewCategory): Promise<ICategory> {
    return ElectronEventEmitter.emitOrThrow('createCategory', category);
}

export async function updateCategory(id: number, category: Partial<NewCategory>): Promise<ICategory> {
    return ElectronEventEmitter.emitOrThrow('updateCategory', { id, category });
}

export async function deleteCategory(id: number): Promise<void> {
    return ElectronEventEmitter.emitOrThrow('deleteCategory', { id });
}
