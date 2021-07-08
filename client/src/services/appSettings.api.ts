import { EventEmitter } from './EventEmitter';

export async function changeColorForApp(appName: string, color: string) {
    return EventEmitter.emit('changeColorForApp', { appName, color });
}
