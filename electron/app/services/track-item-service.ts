import { logManager } from '../log-manager';
import { settingsService } from './settings-service';
import { State } from '../enums/state';
import { stateManager } from '../state-manager';
import { TrackItem } from '../models/TrackItem';

export class TrackItemService {
    logger = logManager.getLogger('TrackItemService');

    async createTrackItem(trackItemAttributes: TrackItem): Promise<TrackItem> {
        let trackItem = await TrackItem.query().insert(trackItemAttributes);
        // this.logger.debug(`Created trackItem :`, trackItem.toJSON());
        return trackItem;
    }

    async updateTrackItem(itemData: TrackItem, id: number) {
        let count = await TrackItem.query()
            .findById(id)
            .patch({
                app: itemData.app,
                title: itemData.title,
                color: itemData.color,
                beginDate: itemData.beginDate,
                endDate: itemData.endDate,
            });

        return count;
    }

    findAllItems(from, to, taskName, searchStr, paging) {
        let order = paging.order || 'beginDate';
        let orderSort = paging.orderSort || 'asc';
        if (order.startsWith('-')) {
            order = order.substring(1);
            orderSort = 'desc';
        }

        let limit = paging.limit || 10;
        let offset = paging.offset || 0;
        if (paging.page) {
            offset = (paging.page - 1) * limit;
        }

        const query = TrackItem.query()
            .where('taskName', taskName)
            .where('endDate', '>=', from)
            .where('endDate', '<', to)
            .limit(limit)
            .offset(offset)
            .orderBy(order, orderSort);

        if (searchStr) {
            query.where('title', 'like', '%' + searchStr + '%');
        }

        return query;
    }

    async findAllDayItems(from, to, taskName) {
        return TrackItem.query()
            .where('taskName', taskName)
            .where('endDate', '>=', from)
            .where('endDate', '<=', to)
            .orderBy('beginDate', 'asc');
    }

    findFirstLogItems() {
        return TrackItem.query()
            .where('taskName', 'LogTrackItem')
            .limit(200)
            .orderBy('beginDate', 'desc');
    }

    findLastOnlineItem() {
        // ONLINE item can be just inserted, we want old one.
        // 2 seconds should be enough
        let currentStatusItem = stateManager.getCurrentStatusTrackItem();

        if (currentStatusItem && currentStatusItem.app !== State.Online) {
            throw new Error('Not online 2.');
        }

        const query = TrackItem.query()
            .where('app', State.Online)
            .where('taskName', 'StatusTrackItem')
            .orderBy('endDate', 'desc');

        if (currentStatusItem) {
            this.logger.debug(
                'Find by excluding currentStatus item id:',
                currentStatusItem.toJSON(),
            );
            query.whereNot('id', currentStatusItem.id);
        }

        return query;
    }

    updateTrackItemColor(appName, color) {
        this.logger.debug('Updating app color:', appName, color);

        return TrackItem.query()
            .patch({ color: color })
            .where('app', appName);
    }

    findById(id) {
        return TrackItem.query().findById(id);
    }

    async deleteById(id) {
        // TODO: not used
        await TrackItem.query().deleteById(id);

        this.logger.debug('Deleted track item with ID:', id);
        return id;
    }

    async deleteByIds(ids) {
        await TrackItem.query()
            .delete()
            .whereIn('id', ids);
        return ids;
    }

    async findRunningLogItem() {
        let item = await settingsService.findByName('RUNNING_LOG_ITEM');

        if (!item) {
            this.logger.debug('No RUNNING_LOG_ITEM.');
            return null;
        }

        this.logger.debug('Found RUNNING_LOG_ITEM config: ', item.toJSON());

        let logTrackItemId = item.jsonData && item.jsonData.id;
        if (!logTrackItemId) {
            this.logger.debug('No RUNNING_LOG_ITEM ref id');
            return null;
        }

        let logItem = await this.findById(logTrackItemId);
        if (!logItem) {
            this.logger.error('RUNNING_LOG_ITEM not found by id:', logTrackItemId);
            return null;
        }
        return logItem;
    }
}

export const trackItemService = new TrackItemService();
