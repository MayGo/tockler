import { Logger } from '../logger';

const { ipcRenderer } = window as any;

function send(name, ...args) {
    Logger.debug(`Send event: ${name}`);
    ipcRenderer.send(name, ...args);
}
function on(name, listener) {
    ipcRenderer.on(name, listener);
}

function off(name, listener) {
    ipcRenderer.removeListener(name, listener);
}

function once(name, listener) {
    ipcRenderer.once(name, listener);
}

export const EventEmitter = {
    send,
    on,
    off,
    once,
};
