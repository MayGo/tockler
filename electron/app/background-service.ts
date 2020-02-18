import { trackItemService } from './services/track-item-service';
import { appSettingService } from './services/app-setting-service';
import { State } from './enums/state';
import { logManager } from './log-manager';
import { stateManager } from './state-manager';
import BackgroundUtils from './background-utils';
import { TrackItemType } from './enums/track-item-type';
import { TrackItem } from './models/TrackItem';

let logger = logManager.getLogger('BackgroundService');

export class BackgroundService {
    async addInactivePeriod(beginDate, endDate) {
        let rawItem: any = { app: State.Offline, title: State.Offline.toString().toLowerCase() };
        rawItem.taskName = TrackItemType.StatusTrackItem;
        rawItem.beginDate = beginDate;
        rawItem.endDate = endDate;
        logger.debug('Adding inactive trackitem', rawItem);

        stateManager.resetStatusTrackItem();

        let item = await this.createOrUpdate(rawItem);
        return item;
    }

    async createItems(items): Promise<any> {
        const promiseArray = items.map(async newItem => {
            const savedItem = await trackItemService.createTrackItem(newItem);
            return savedItem;
        });

        logger.debug('Created items');
        return await Promise.all(promiseArray);
    }

    async createOrUpdate(rawItem) {
        try {
            let color = await appSettingService.getAppColor(rawItem.app);
            rawItem.color = color;

            let item: TrackItem;

            let type: TrackItemType = rawItem.taskName;

            if (!type) {
                throw new Error('TaskName not defined.');
            }

            if (BackgroundUtils.shouldSplitInTwoOnMidnight(rawItem.beginDate, rawItem.endDate)) {
                let items = BackgroundUtils.splitItemIntoDayChunks(rawItem);

                if (stateManager.hasSameRunningTrackItem(rawItem)) {
                    let firstItem = items.shift();
                    await stateManager.endRunningTrackItem(firstItem);
                }
                try {
                    let savedItems = await this.createItems(items);

                    let lastItem = savedItems[savedItems.length - 1];
                    item = lastItem;
                } catch (e) {
                    logger.error('Error creating items');
                }
            } else {
                if (stateManager.hasSameRunningTrackItem(rawItem)) {
                    item = await stateManager.updateRunningTrackItemEndDate(type);
                } else if (!stateManager.hasSameRunningTrackItem(rawItem)) {
                    item = await stateManager.createNewRunningTrackItem(rawItem);
                }
            }

            stateManager.setCurrentTrackItem(item);

            return item;
        } catch (e) {
            logger.error('Error createOrUpdate', e);
        }
    }

    onSleep() {
        stateManager.setSystemToSleep();
    }

    async onResume() {
        let statusTrackItem = stateManager.getCurrentStatusTrackItem();
        if (statusTrackItem != null) {
            let item = await this.addInactivePeriod(statusTrackItem.endDate, new Date());
            await stateManager.setAwakeFromSleep();
        } else {
            logger.debug('No lastTrackItems.StatusTrackItem for addInactivePeriod.');
        }
    }
}

export const backgroundService = new BackgroundService();
