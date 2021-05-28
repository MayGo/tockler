import { logManager } from '../log-manager';
import { TrackItem } from '../models/TrackItem';

let logger = logManager.getLogger('BackgroundJob');

export class SaveToDbJob {
    async run() {
        const items = await TrackItem.query()
            .where('taskName', 'AppTrackItem')
            .where('ongoing', '=', true);
        console.log(items);
    }
}

export const saveToDbJob = new SaveToDbJob();
