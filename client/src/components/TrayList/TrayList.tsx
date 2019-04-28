import * as React from 'react';
// import { Layout } from 'antd';
import { List } from 'antd';
import { TrayListItem } from './TrayListItem';
import { groupBy, map, sumBy, sortBy } from 'lodash';
import { convertDate } from '../../constants';

const sumDiff = data => sumBy(data, c => convertDate(c.endDate).diff(convertDate(c.beginDate)));

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

export function TrayList({ lastLogItems, loading, dispatch, runningLogItem }: any) {
    function startNewLogItemFromOld(oldItem) {
        dispatch({
            type: 'tray/startNewLogItem',
            payload: { item: oldItem },
        });
    }
    function stopRunningLogItem() {
        dispatch({
            type: 'tray/stopRunningLogItem',
        });
    }

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
                    startNewLogItemFromOld={startNewLogItemFromOld}
                    stopRunningLogItem={stopRunningLogItem}
                />
            )}
        />
    );
}
