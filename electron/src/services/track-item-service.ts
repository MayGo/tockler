import { logManager } from '../log-manager';
import { settingsService } from './settings-service';
import { State } from '../enums/state';
import { stateManager } from '../state-manager';
import { TrackItem } from '../models/TrackItem';
import { dialog } from 'electron';
import { writeFileSync } from 'fs';
import * as stringify from 'csv-stringify/lib/sync';
import moment = require('moment');
import { raw } from 'objection';

export class TrackItemService {
    logger = logManager.getLogger('TrackItemService');

    async createTrackItem(trackItemAttributes: TrackItem): Promise<TrackItem> {
        let trackItem = await TrackItem.query().insert(trackItemAttributes);
        // this.logger.debug(`Created trackItem :`, trackItem.toJSON());
        return trackItem;
    }

    async updateTrackItem(itemData: TrackItem, id: number) {
        let count = await TrackItem.query().findById(id).patch({
            app: itemData.app,
            title: itemData.title,
            url: itemData.url,
            color: itemData.color,
            beginDate: itemData.beginDate,
            endDate: itemData.endDate,
        });

        return count;
    }

    async findAndExportAllItems(from, to, taskName, searchStr) {
        const query = TrackItem.query()
            .where('taskName', taskName)
            .where('endDate', '>=', from)
            .where('endDate', '<', to);

        if (searchStr) {
            query.where('title', 'like', '%' + searchStr + '%');
        }

        const toDateStr = (timestamp) => moment(timestamp).format('YYYY-MM-DD');
        const toDateTimeStr = (timestamp) => moment(timestamp).format('YYYY-MM-DD HH:mm:ss');

        const results = await query;

        const csvContent = stringify(results, {
            delimiter: ';',
            cast: {
                number: function (value, { column }) {
                    if (['endDate', 'beginDate'].includes(column.toString())) {
                        return toDateTimeStr(value);
                    }
                    return value?.toString();
                },
            },
            header: true,
            columns: [
                {
                    key: 'app',
                    header: 'App',
                },
                {
                    key: 'taskName',
                    header: 'Type',
                },
                {
                    key: 'title',
                    header: 'Title',
                },
                {
                    key: 'beginDate',
                    header: 'Begin',
                },
                {
                    key: 'endDate',
                    header: 'End',
                },
            ],
        });

        const dialogOpts = {
            defaultPath: `*/tockler-export_${toDateStr(from)}_${toDateStr(to)}`,
            filters: [{ name: 'tockler-export', extensions: ['csv'] }],
        };
        const file = dialog.showSaveDialogSync(dialogOpts);

        if (file) {
            writeFileSync(file, csvContent, 'utf8');
        }

        return true;
    }
    findAllItems(from, to, taskName, searchStr, paging, sumTotal) {
        let order = paging.order || 'beginDate';
        let orderSort = paging.orderSort || 'asc';
        if (order.startsWith('-')) {
            order = order.substring(1);
            orderSort = 'desc';
        }

        let pageSize = paging.pageSize || 10;
        // Objections.js uses 0 based paging
        let pageIndex = paging.pageIndex ? paging.pageIndex : 0;

        const query = TrackItem.query()
            .where('taskName', taskName)
            .where('endDate', '>=', from)
            .where('endDate', '<', to)
            .page(pageIndex, pageSize)
            .orderBy(order, orderSort);

        if (searchStr) {
            query.where(function () {
                this.where('title', 'like', '%' + searchStr + '%').orWhere('url', 'like', '%' + searchStr + '%');
            });
        }

        if (sumTotal) {
            query.sum(raw('endDate-beginDate'));
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
        return TrackItem.query().where('taskName', 'LogTrackItem').limit(200).orderBy('beginDate', 'desc');
    }
    findFirstTrackItem() {
        return TrackItem.query().limit(1).orderBy('beginDate', 'asc');
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
            this.logger.debug('Find by excluding currentStatus item id:', currentStatusItem.toJSON());
            query.whereNot('id', currentStatusItem.id);
        }

        return query;
    }

    updateTrackItemColor(appName, color) {
        this.logger.debug('Updating app color:', appName, color);

        return TrackItem.query().patch({ color: color }).where('app', appName);
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
        await TrackItem.query().delete().whereIn('id', ids);
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
