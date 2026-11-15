import EventEmitter from 'eventemitter3';
import { TrackItemRaw } from '../app/task-analyser.utils';
import { NormalizedActiveWindow } from '../background/watchTrackItems/watchForActiveWindow.utils';
import { State } from '../enums/state';

type AppEvents = {
    'start-new-log-item2': (item: TrackItemRaw) => void;
    'system-is-idling': () => void;
    'system-is-engaged': () => void;
    'system-is-sleeping': () => void;
    'system-is-resuming': () => void;
    'state-changed': (state: State) => void;
    'active-window-changed': (activeWindow: NormalizedActiveWindow) => void;
    'smallNotificationsEnabled-changed': (smallNotificationsEnabled: boolean) => void;
    /** A log item was started or stopped and saved; windows listing log items should reload. */
    'log-items-changed': () => void;
};

export const appEmitter = new EventEmitter<AppEvents>();
