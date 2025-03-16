import { ElectronEventEmitter } from './ElectronEventEmitter';

export async function changeColorForApp(appName: string, color: string) {
    return ElectronEventEmitter.emit('changeColorForApp', { appName, color });
}
