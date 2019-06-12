import * as log from 'loglevel';

log.setLevel(process.env.LOG_LEVEL || 'info');

export const Logger = log;
