// Define interface for electron bridge

export interface ElectronBridge {
    platform: string;
    configGet: (key: string) => unknown;
    configSet: (key: string, value: unknown) => void;
    logger: {
        debug: (message: string, ...args: unknown[]) => void;
        info: (message: string, ...args: unknown[]) => void;
        warn: (message: string, ...args: unknown[]) => void;
        error: (message: string, ...args: unknown[]) => void;
    };
    isMas: boolean;
    appVersion: () => Promise<string>;
    invokeIpc: <T = unknown>(actionName: string, payload?: unknown) => Promise<T>;
    sendIpc: (key: string, ...args: unknown[]) => void;
    onIpc: (key: string, fn: (...args: unknown[]) => void) => void;
    removeListenerIpc: (key: string) => void;
    openUrlInExternalWindow: (url: string) => void;
}

// Extend Window interface to include electronBridge
declare global {
    interface Window {
        electronBridge: ElectronBridge;
    }
}
