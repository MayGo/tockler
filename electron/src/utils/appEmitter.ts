import EventEmitter from 'eventemitter3';
import { TrackItemRaw } from '../app/task-analyser';

type AppEvents = {
    'start-new-log-item2': (item: TrackItemRaw) => void;
    'system-is-idling': () => void;
    'system-is-engaged': () => void;
    'system-is-sleeping': () => void;
    'system-is-resuming': () => void;
};

export const appEmitter = new EventEmitter<AppEvents>();
