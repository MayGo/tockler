import EventEmitter from 'eventemitter3';
import { TrackItemRaw } from '../app/task-analyser';

type AppEvents = {
    'start-new-log-item2': (item: TrackItemRaw) => void;
};

export const appEmitter = new EventEmitter<AppEvents>();
