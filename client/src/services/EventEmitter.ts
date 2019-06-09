// tslint:disable-next-line: no-implicit-dependencies no-var-requires
const electron = require('electron');

const { ipcRenderer, remote } = electron;

function send(name) {
    console.debug(`Send event: ${name}`);
    ipcRenderer.send(name);
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

function emit(name, ...args) {
    console.log(name);
    remote.getCurrentWindow().webContents.send(name, ...args);
}

export const EventEmitter = {
    send,
    emit,
    on,
    off,
    once,
};
