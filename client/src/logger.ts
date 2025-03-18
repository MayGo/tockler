import log from 'electron-log/renderer';

// Set reasonable log levels
log.transports.console.level = 'info';
log.transports.ipc.level = 'info';

// Prevent excessive logging by filtering messages
const originalConsoleTransport = log.transports.console;
const ignorePatterns = [
    'Warning: ',
    'React does not recognize',
    'Unknown prop',
    'Invalid DOM property',
    'Non-serializable values were found',
];

// Create a wrapped console transport that filters messages
log.transports.console.level = originalConsoleTransport.level;
log.transports.console.format = originalConsoleTransport.format;

// Override just the write function
const originalWriteFn = log.transports.console.writeFn;
log.transports.console.writeFn = (messageObj) => {
    // Skip messages matching ignore patterns
    const message = messageObj.message || messageObj;
    const msgStr = String((message.data && message.data[0]) || '');
    if (ignorePatterns.some((pattern) => msgStr.includes(pattern))) {
        return;
    }

    originalWriteFn(messageObj);
};

export const Logger = log;
