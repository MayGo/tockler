import { List } from 'antd';
import { groupBy, map, sortBy, sumBy } from 'lodash';
import React, { memo } from 'react';
import { convertDate } from '../../constants';
import { TrayListItem } from './TrayListItem';

const sumDiff = data =>
    sumBy(data, (c: any) => convertDate(c.endDate).diff(convertDate(c.beginDate)));

const aggregateSameAppAndName = lastLogItems => {
    const grouped = groupBy(lastLogItems, item => `${item.app}_${item.title}`);

    const mapped = map(grouped, items => {
        return {
            app: items[0].app,
            title: items[0].title,
            beginDate: sortBy(items, ['beginDate'])[0].beginDate,
            endDate: sortBy(items, ['endDate'])[items.length - 1].endDate,
            totalMs: sumDiff(items),
        };
    });

    return mapped;
};

export function TrayListPlain({
    lastLogItems,
    loading,
    runningLogItem,
    stopRunningLogItem,
    startNewLogItem,
}: any) {
    // Remove runningLogItem from aggregated values and show it as running Item
    let items;
    if (runningLogItem) {
        items = aggregateSameAppAndName(lastLogItems.filter(item => item.id !== runningLogItem.id));
        items.unshift(runningLogItem);
    } else {
        items = aggregateSameAppAndName(lastLogItems);
    }

    return (
        <List
            loading={loading}
            itemLayout="horizontal"
            dataSource={items}
            renderItem={(item: any) => (
                <TrayListItem
                    item={item}
                    isRunning={runningLogItem && item.id === runningLogItem.id}
                    startNewLogItemFromOld={startNewLogItem}
                    stopRunningLogItem={stopRunningLogItem}
                />
            )}
        />
    );
}

TrayListPlain.whyDidYouRender = true;

export const TrayList = memo(TrayListPlain);
