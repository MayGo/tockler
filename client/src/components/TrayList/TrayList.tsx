import { StackDivider, VStack } from '@chakra-ui/react';
import { groupBy, map, orderBy, sortBy, sumBy } from 'lodash';
import { memo } from 'react';
import { convertDate } from '../../constants';

import { ITrackItem } from '../../@types/ITrackItem';
import { TrayListItem } from './TrayListItem';

const sumDiff = (data: ITrackItem[]) =>
    sumBy(data, (c: ITrackItem) => convertDate(c.endDate).diff(convertDate(c.beginDate)));

export interface AggregatedTrackItem extends ITrackItem {
    isRunning: boolean;
    beginDate: number;
    endDate: number;
    totalMs: number;
}

const aggregateSameAppAndName = (lastLogItems: ITrackItem[], runningLogItem: ITrackItem | undefined) => {
    const grouped = groupBy(lastLogItems, (item) => `${item.app}_${item.title}`);

    const mapped = map(grouped, (items) => {
        return {
            app: items[0].app,
            title: items[0].title,
            color: items[0].color,
            isRunning: runningLogItem ? !!items.find((item) => item.id === runningLogItem.id) : false,
            beginDate: sortBy(items, ['beginDate'])[0].beginDate,
            endDate: sortBy(items, ['endDate'])[items.length - 1].endDate,
            totalMs: sumDiff(items),
        };
    });

    return mapped;
};

export function TrayListPlain({
    lastLogItems,
    runningLogItem,
    stopRunningLogItem,
    startNewLogItem,
}: {
    lastLogItems: ITrackItem[];
    runningLogItem: ITrackItem | undefined;
    stopRunningLogItem: () => void;
    startNewLogItem: (item: ITrackItem) => void;
}) {
    const aggrItems = aggregateSameAppAndName(lastLogItems, runningLogItem);
    const items: AggregatedTrackItem[] = orderBy(aggrItems, ['isRunning', 'endDate'], ['desc', 'desc']);

    return (
        <VStack spacing={1} align="stretch" divider={<StackDivider borderColor="gray.200" />} position="relative">
            {items.map((item, index) => (
                <TrayListItem
                    key={index}
                    item={item}
                    startNewLogItemFromOld={startNewLogItem}
                    stopRunningLogItem={stopRunningLogItem}
                />
            ))}
        </VStack>
    );
}

export const TrayList = memo(TrayListPlain);
