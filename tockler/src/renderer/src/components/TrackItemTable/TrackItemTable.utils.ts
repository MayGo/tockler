// tslint:disable-next-line: no-submodule-imports

import { sumBy } from 'lodash';
import { dayjs } from '@renderer/dayjs.config';

import { convertDate } from '../../constants';

// A great library for fuzzy filtering/sorting items
import { matchSorter } from 'match-sorter';

export const calculateTotal = (filteredData) => {
    const totalMs = sumBy(filteredData, (c: any) => convertDate(c.endDate).diff(convertDate(c.beginDate)));
    const dur = dayjs.duration(totalMs);

    return dur.format();
};

export const totalToDuration = (totalMs) => dayjs.duration(totalMs).format();

export function fuzzyTextFilterFn(rows, id, filterValue) {
    return matchSorter(rows, filterValue, { keys: [(row: any) => row.values[id]] });
}

// Let the table remove the filter if the string is empty
fuzzyTextFilterFn.autoRemove = (val) => !val;
