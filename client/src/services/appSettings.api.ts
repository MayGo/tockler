import { emit } from 'eiphop';

export async function changeColorForApp(appName: string, color: string) {
    return emit('changeColorForApp', { appName, color });
}
