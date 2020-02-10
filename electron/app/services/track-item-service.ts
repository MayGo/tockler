import { logManager } from '../log-manager';
import { settingsService } from './settings-service';
import { State } from '../enums/state';
import { stateManager } from '../state-manager';
import { Op } from 'sequelize';
import { TrackItem } from '../models/TrackItem';

export class TrackItemService {
    logger = logManager.getLogger('TrackItemService');

    async createTrackItem(trackItemAttributes: TrackItem): Promise<TrackItem> {
        let trackItem = await TrackItem.create(trackItemAttributes);
        // this.logger.info(`Created trackItem :`, trackItem.toJSON());
        return trackItem;
    }

    async updateTrackItem(itemData: TrackItem, id: number) {
        let [count] = await TrackItem.update(
            {
                app: itemData.app,
                title: itemData.title,
                color: itemData.color,
                beginDate: itemData.beginDate,
                endDate: itemData.endDate,
            },
            {
                fields: ['beginDate', 'endDate', 'app', 'title', 'color'],
                where: { id: id },
            },
        );

        return count;
    }

    findAllItems(from, to, taskName, searchStr, paging) {
        let order = paging.order || 'beginDate';
        let orderSort = paging.orderSort || 'ASC';
        if (order.startsWith('-')) {
            order = order.substring(1);
            orderSort = 'DESC';
        }

        let limit = paging.limit || 10;
        let offset = paging.offset || 0;
        if (paging.page) {
            offset = (paging.page - 1) * limit;
        }
        let where: any = {
            endDate: {
                [Op.gte]: from,
                [Op.lt]: to,
            },
            taskName: taskName,
        };

        if (searchStr) {
            where.title = {
                [Op.like]: '%' + searchStr + '%',
            };
        }

        return TrackItem.findAndCountAll({
            where: where,
            raw: true,
            limit: limit,
            offset: offset,
            order: [[order, orderSort]],
        });
    }

    async findAllDayItems(from, to, taskName) {
        const where: any = {
            endDate: {
                [Op.gte]: from,
                [Op.lte]: to,
            },
            taskName: taskName,
        };

        const items = await TrackItem.findAll({
            where: where,
            raw: true,
            order: [['beginDate', 'ASC']],
        });
        return items;
    }

    findFirstLogItems() {
        return TrackItem.findAll({
            where: {
                taskName: 'LogTrackItem',
            },
            raw: true,
            // group: ['app', 'title'],
            limit: 200,
            order: [['beginDate', 'DESC']],
        });
    }

    findLastOnlineItem() {
        // ONLINE item can be just inserted, we want old one.
        // 2 seconds should be enough
        let currentStatusItem = stateManager.getCurrentStatusTrackItem();

        if (currentStatusItem && currentStatusItem.app !== State.Online) {
            throw new Error('Not online 2.');
        }

        let whereQuery: any = {
            app: State.Online,
            taskName: 'StatusTrackItem',
        };

        if (currentStatusItem) {
            this.logger.debug(
                'Find by excluding currentStatus item id:',
                currentStatusItem.toJSON(),
            );
            whereQuery.id = {
                [Op.ne]: currentStatusItem.id,
            };
        }

        return TrackItem.findAll({
            where: whereQuery,
            limit: 1,
            order: [['endDate', 'DESC']],
        });
    }

    updateTrackItemColor(appName, color) {
        this.logger.info('Updating app color:', appName, color);

        return TrackItem.update(
            { color: color },
            {
                fields: ['color'],
                where: {
                    app: appName,
                },
            },
        ).catch((error: Error) => {
            this.logger.error(error.message);
        });
    }

    findById(id) {
        return TrackItem.findByPk(id);
    }

    async deleteById(id) {
        // TODO: not used
        await TrackItem.destroy({
            where: { id: id },
        });

        this.logger.info('Deleted track item with ID:', id);
        return id;
    }

    async deleteByIds(ids) {
        await TrackItem.destroy({
            where: {
                id: {
                    [Op.in]: ids,
                },
            },
        });
        return ids;
    }

    async findRunningLogItem() {
        let item = await settingsService.findByName('RUNNING_LOG_ITEM');

        if (!item) {
            this.logger.debug('No RUNNING_LOG_ITEM.');
            return null;
        }

        this.logger.debug('Found RUNNING_LOG_ITEM config: ', item.toJSON());

        let logTrackItemId = item.jsonData.id;
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
