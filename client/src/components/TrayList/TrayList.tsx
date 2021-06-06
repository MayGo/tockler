import { VStack } from '@chakra-ui/layout';
import { Spinner } from '@chakra-ui/spinner';
import { groupBy, map, sortBy, sumBy } from 'lodash';
import React, { memo } from 'react';
import { convertDate } from '../../constants';
import { SpinnerContainer } from '../Timeline/Timeline.styles';
import { TrayListItem } from './TrayListItem';

const sumDiff = data =>
    sumBy(data, (c: any) => convertDate(c.endDate).diff(convertDate(c.beginDate)));

const aggregateSameAppAndName = lastLogItems => {
    const grouped = groupBy(lastLogItems, item => `${item.app}_${item.title}`);

    const mapped = map(grouped, items => {
        return {
            app: items[0].app,
            title: items[0].title,
            color: items[0].color,
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
        <VStack spacing={1} align="stretch">
            {loading && (
                <SpinnerContainer>
                    <Spinner />
                </SpinnerContainer>
            )}
            {items.map(item => (
                <TrayListItem
                    item={item}
                    isRunning={runningLogItem && item.id === runningLogItem.id}
                    startNewLogItemFromOld={startNewLogItem}
                    stopRunningLogItem={stopRunningLogItem}
                />
            ))}
        </VStack>
    );
}

TrayListPlain.whyDidYouRender = true;

export const TrayList = memo(TrayListPlain);
