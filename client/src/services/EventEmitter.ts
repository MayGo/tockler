import { Logger } from '../logger';

const { electron } = window as any;
const { invokeIpc, sendIpc, onIpc, removeListenerIpc } = electron;

function send(name, ...args) {
    Logger.debug(`Send event: ${name}`);

    sendIpc(name, ...args);
}
function on(name, listener) {
    onIpc(name, listener);
}

function off(name, listener) {
    removeListenerIpc(name, listener);
}

export const EventEmitter = {
    send,
    on,
    off,
    emit: invokeIpc,
};
