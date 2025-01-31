// tslint:disable-next-line: no-submodule-imports

import { useMemo } from 'react';
import { TrackItemType } from '../../enum/TrackItemType';
import { filterItems } from '../Timeline/timeline.utils';
import { checkIfOneDay } from '../../timeline.util';
import { useStoreState } from '../../store/easyPeasy';
import { ItemsTable } from './ItemsTable';

export const TrackItemTable = ({ type, resetButtonsRef }) => {
    const timeItems = useStoreState((state) => state.timeItems);
    const visibleTimerange = useStoreState((state) => state.visibleTimerange);

    const data = useMemo(
        () =>
            type === TrackItemType.AppTrackItem
                ? filterItems(timeItems.appItems, visibleTimerange)
                : filterItems(timeItems.logItems, visibleTimerange),
        [type, timeItems.appItems, timeItems.logItems, visibleTimerange],
    );

    const isOneDay = checkIfOneDay(visibleTimerange);

    return (
        <ItemsTable
            data={data}
            resetButtonsRef={resetButtonsRef}
            isOneDay={isOneDay}
            isSearchTable={false}
            total={0}
            manualSortBy={false}
        />
    );
};
