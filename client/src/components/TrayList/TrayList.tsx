import { StackDivider, VStack } from '@chakra-ui/react';
import { memo } from 'react';

import { orderBy } from 'lodash';
import { ITrackItem } from '../../@types/ITrackItem';
import { TrayListItem } from './TrayListItem';

export interface AggregatedTrackItem extends ITrackItem {
    totalDuration: number;
}

const getKey = (item: ITrackItem) => `${item.app}_${item.title}`;

export function TrayListPlain({
    lastLogItems,
    runningLogItem,
    stopRunningLogItem,
    startNewLogItem,
}: {
    lastLogItems: AggregatedTrackItem[];
    runningLogItem: ITrackItem | undefined;
    stopRunningLogItem: () => void;
    startNewLogItem: (item: AggregatedTrackItem) => void;
}) {
    const items: AggregatedTrackItem[] = orderBy(lastLogItems, ['endDate'], ['desc']);

    return (
        <VStack spacing={1} align="stretch" divider={<StackDivider borderColor="gray.200" />} position="relative">
            {items.map((item, index) => (
                <TrayListItem
                    key={index}
                    item={item}
                    isRunning={runningLogItem ? getKey(item) === getKey(runningLogItem) : false}
                    startNewLogItemFromOld={startNewLogItem}
                    stopRunningLogItem={stopRunningLogItem}
                />
            ))}
        </VStack>
    );
}

export const TrayList = memo(TrayListPlain);
