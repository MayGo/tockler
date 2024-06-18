import { EventEmitter } from 'events';

class AppEmitter extends EventEmitter {}

export const appEmitter = new AppEmitter();
