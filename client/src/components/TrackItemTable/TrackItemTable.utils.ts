// tslint:disable-next-line: no-submodule-imports

import { FilterFn, Row } from '@tanstack/react-table';
import { differenceInMilliseconds } from 'date-fns';
import { sumBy } from 'lodash';
import { matchSorter } from 'match-sorter';
import { ITrackItem } from '../../@types/ITrackItem';
import { formatDurationInternal } from '../../utils';

export const calculateTotal = (filteredData: ITrackItem[]) => {
    const totalMs = sumBy(filteredData, (trackItem: ITrackItem) => {
        return differenceInMilliseconds(trackItem.endDate, trackItem.beginDate);
    });

    return formatDurationInternal(totalMs);
};

// Use matchSorter for fuzzy matching
export const fuzzyTextFilterFn: FilterFn<ITrackItem> = (row: Row<ITrackItem>, columnId: string, value: string) => {
    // Rank the item
    const itemRank = matchSorter([row.getValue(columnId)], value);

    return itemRank.length > 0;
};

// Let the table remove the filter if the string is empty
fuzzyTextFilterFn.autoRemove = (val: string) => !val;
