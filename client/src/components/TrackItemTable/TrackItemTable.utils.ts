import { FilterFn, Row, SortingState } from '@tanstack/react-table';
import { ITrackItem } from '../../@types/ITrackItem';

/** Case-insensitive; every whitespace-separated word of `query` must appear somewhere in `value`, in any order. */
export const containsAllWords = (value: unknown, query: string) => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    const text = String(value ?? '').toLowerCase();
    return words.every((word) => text.includes(word));
};

export const containsAllWordsFilter: FilterFn<ITrackItem> = (row, columnId, filterValue: string) =>
    containsAllWords(row.getValue(columnId), filterValue);

containsAllWordsFilter.autoRemove = (value: unknown) => typeof value !== 'string' || !value.trim();

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
