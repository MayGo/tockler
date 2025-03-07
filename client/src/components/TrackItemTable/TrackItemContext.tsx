import React, { createContext, useContext } from 'react';
import { Row, SortingRule } from 'react-table';
import { ITrackItem } from '../../@types/ITrackItem';

interface TrackItemContextType {
    selectedFlatRows: Row<ITrackItem>[];
    selectedRowIds: Record<string, boolean>;
    setAllFilters: (filters: unknown[]) => void;
    setSortBy: (sortBy: SortingRule<ITrackItem>[]) => void;
    pageIndex: number;
    pageSize: number;
    fetchData?: (options: { pageIndex: number; pageSize: number; sortBy: SortingRule<ITrackItem>[] }) => void;
}

const TrackItemContext = createContext<TrackItemContextType>({
    selectedFlatRows: [],
    selectedRowIds: {},
    setAllFilters: () => {},
    setSortBy: () => {},
    pageIndex: 0,
    pageSize: 10,
    fetchData: undefined,
});

export const TrackItemProvider: React.FC<{
    children: React.ReactNode;
    value: TrackItemContextType;
}> = ({ children, value }) => {
    return <TrackItemContext.Provider value={value}>{children}</TrackItemContext.Provider>;
};

export const useTrackItemContext = () => useContext(TrackItemContext);
