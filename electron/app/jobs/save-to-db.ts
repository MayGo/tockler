import { logManager } from '../log-manager';
import { TrackItem } from '../models/TrackItem';

let logger = logManager.getLogger('BackgroundJob');

export class SaveToDbJob {
    lastSavedAt: Date = new Date();

    async run() {
        const items = await TrackItem.query()
            .where('taskName', 'AppTrackItem')
            .whereNull('userEventId')
            .orWhere('updatedAt', '>=', this.lastSavedAt);
        console.log(items.length);

        this.lastSavedAt = new Date();
    }
}

export const saveToDbJob = new SaveToDbJob();
