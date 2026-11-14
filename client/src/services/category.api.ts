import { ICategory, NewCategory } from '../@types/ICategory';
import { ElectronEventEmitter } from './ElectronEventEmitter';

export async function getCategories(): Promise<ICategory[]> {
    return ElectronEventEmitter.emit('getCategories');
}

export async function createCategory(category: NewCategory): Promise<ICategory> {
    return ElectronEventEmitter.emit('createCategory', category);
}

export async function updateCategory(id: number, category: Partial<NewCategory>): Promise<ICategory> {
    return ElectronEventEmitter.emit('updateCategory', { id, category });
}

export async function deleteCategory(id: number): Promise<void> {
    return ElectronEventEmitter.emit('deleteCategory', { id });
}
