const EventEmitter = require('events');

class AppEmitter extends EventEmitter {}

export const appEmitter = new AppEmitter();
