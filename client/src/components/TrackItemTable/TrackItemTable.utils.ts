// tslint:disable-next-line: no-submodule-imports

import { sumBy } from 'lodash';
import { differenceInMilliseconds } from 'date-fns';
import { matchSorter } from 'match-sorter';
import { formatDurationInternal } from '../../utils';

export const calculateTotal = (filteredData) => {
    const totalMs = sumBy(filteredData, (c: any) => {
        return differenceInMilliseconds(c.endDate, c.beginDate);
    });

    return formatDurationInternal(totalMs);
};

export function fuzzyTextFilterFn(rows, id, filterValue) {
    return matchSorter(rows, filterValue, { keys: [(row: any) => row.values[id]] });
}

// Let the table remove the filter if the string is empty
fuzzyTextFilterFn.autoRemove = (val) => !val;
