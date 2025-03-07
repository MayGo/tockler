// tslint:disable-next-line: no-submodule-imports

import { Button, HStack, Text } from '@chakra-ui/react';
import { Row, SortingState } from '@tanstack/react-table';
import { ITrackItem } from '../../@types/ITrackItem';
import { Logger } from '../../logger';
import { deleteByIds } from '../../services/trackItem.api';
import { useStoreActions } from '../../store/easyPeasy';

export interface TableButtonsProps {
    selectedFlatRows: Row<ITrackItem>[];
    selectedRowIds: Record<string, boolean>;
    setAllFilters: () => void;
    setSortBy: (sortBy: SortingState) => void;
    pageIndex: number;
    pageSize: number;
    fetchData?: (options: { pageIndex: number; pageSize: number; sortBy: SortingState }) => void;
}

export const TrackItemTableButtons: React.FC<TableButtonsProps> = (props) => {
    const { selectedFlatRows, selectedRowIds, setAllFilters, setSortBy } = props;

    const fetchTimerange = useStoreActions((actions) => actions.fetchTimerange);

    const deleteTimelineItems = async (ids: number[]) => {
        Logger.debug('Delete timeline items', ids);

        if (ids) {
            await deleteByIds(ids);
            Logger.debug('Deleted timeline items', ids);
            fetchTimerange();
        } else {
            Logger.error('No ids, not deleting from DB');
        }
    };

    const deleteSelectedItems = () => {
        deleteTimelineItems(selectedFlatRows.map(({ original }) => original.id));
    };

    const hasSelected = Object.keys(selectedRowIds).length > 0;

    return (
        <HStack pb={4}>
            {hasSelected && (
                <Button variant="outline" onClick={deleteSelectedItems} disabled={!hasSelected}>
                    Delete
                    <Text fontWeight="bold" p={2}>
                        {Object.keys(selectedRowIds).length}
                    </Text>
                    items
                </Button>
            )}

            <Button variant="outline" onClick={() => setAllFilters()}>
                Clear filters
            </Button>

            <Button
                variant="outline"
                onClick={() => {
                    setSortBy([]);
                    setAllFilters();
                }}
            >
                Clear filters and sorters
            </Button>
        </HStack>
    );
};
