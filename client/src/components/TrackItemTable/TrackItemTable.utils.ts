import { FilterFn, Row, SortingState } from '@tanstack/react-table';
import { differenceInMilliseconds } from 'date-fns';
import { sumBy } from 'lodash';
import { matchSorter } from 'match-sorter';
import { ITrackItem } from '../../@types/ITrackItem';

export const calculateTotal = (filteredData: ITrackItem[]) => {
    const totalMs = sumBy(filteredData, (trackItem: ITrackItem) => {
        return differenceInMilliseconds(trackItem.endDate, trackItem.beginDate);
    });

    return totalMs;
};

// Use matchSorter for fuzzy matching
export const fuzzyTextFilterFn: FilterFn<ITrackItem> = (row: Row<ITrackItem>, columnId: string, value: string) => {
    // Rank the item
    const itemRank = matchSorter([row.getValue(columnId)], value);

    return itemRank.length > 0;
};

// Let the table remove the filter if the string is empty
fuzzyTextFilterFn.autoRemove = (val: string) => !val;

export interface TableButtonsProps {
    selectedFlatRows: Row<ITrackItem>[];
    selectedRowIds: Record<string, boolean>;
    setAllFilters: () => void;
    setSortBy: (sortBy: SortingState) => void;
    pageIndex: number;
    pageSize: number;
    fetchData?: (options: { pageIndex: number; pageSize: number; sortBy: SortingState }) => void;
}

export const defaultTableButtonsProps: TableButtonsProps = {
    selectedFlatRows: [],
    selectedRowIds: {},
    setAllFilters: () => {},
    setSortBy: () => {},
    pageIndex: 0,
    pageSize: 10,
    fetchData: () => {},
};
