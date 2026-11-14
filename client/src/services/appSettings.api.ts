import { IAppSetting } from '../@types/IAppSetting';
import { ICategory } from '../@types/ICategory';
import { ElectronEventEmitter } from './ElectronEventEmitter';

export async function changeColorForApp(appName: string, color: string) {
    return ElectronEventEmitter.emit('changeColorForApp', { appName, color });
}

export async function setCategoryForApp(appName: string, categoryId: number | null): Promise<IAppSetting> {
    return ElectronEventEmitter.emitOrThrow('setCategoryForApp', { appName, categoryId });
}

export async function retrieveAllAppSettingsWithCategory(): Promise<(IAppSetting & { category: ICategory | null })[]> {
    return ElectronEventEmitter.emitOrThrow('retrieveAllAppSettingsWithCategory');
}
