'use strict';

const { contextBridge, ipcRenderer, shell } = require('electron');
const Store = require('electron-store');

const Sentry = require('@sentry/electron');

const config = new Store();

if (process.env.NODE_ENV === 'production') {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV,
        release: process.env.npm_package_version,
        beforeSend(event: unknown) {
            // Check if it is an exception, if so, show the report dialog
            if (event && typeof event === 'object' && 'exception' in event) {
                Sentry.showReportDialog();
            }
            return event;
        },
    });
}

// Used type definitions
interface Listeners {
    [key: string]: (...args: unknown[]) => void;
}

const listeners: Listeners = {};

contextBridge.exposeInMainWorld('electronBridge', {
    configGet: (key: string) => {
        return config.get(key);
    },
    configSet: (key: string, value: unknown) => {
        return config.set(key, value);
    },
    platform: process.platform,
    isMas: process.mas === true,
    appVersion: () => ipcRenderer.invoke('get-app-version'),

    openUrlInExternalWindow: (url: string) => {
        console.info('URL', url);

        if (url.startsWith('file://') || url.startsWith('http://127.0.0.1:3000')) {
            return;
        }

        // open url in a browser and prevent default
        shell.openExternal(url);
    },

    invokeIpc: async (actionName: string, payload: unknown) => {
        return await ipcRenderer.invoke(actionName, payload);
    },
    sendIpc: (key: string, ...args: unknown[]) => {
        console.debug('Send message with key: ' + key, args);
        ipcRenderer.send(key, ...args);
    },
    onIpc: (key: string, fn: (...args: unknown[]) => void) => {
        const saferFn = (_event: unknown, ...args: unknown[]) => fn(...args);
        // Deliberately strip event as it includes `sender`
        console.debug('Add listener with key: ' + key);
        ipcRenderer.on(key, saferFn);
        listeners[key] = saferFn;
    },
    removeListenerIpc: (key: string) => {
        console.debug('Remove listener with key: ' + key);
        const fn = listeners[key];
        ipcRenderer.removeListener(key, fn);
        delete listeners[key];
    },
});

declare global {
    interface Window {
        Sentry: typeof Sentry;
    }
}

window.Sentry = Sentry;
