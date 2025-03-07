// tslint:disable-next-line: no-submodule-imports

import { Button, HStack, Text } from '@chakra-ui/react';
import { Row, SortingRule } from 'react-table';
import { ITrackItem } from '../../@types/ITrackItem';
import { Logger } from '../../logger';
import { deleteByIds } from '../../services/trackItem.api';
import { useStoreActions } from '../../store/easyPeasy';
import { useTrackItemContext } from '../TrackItemTable/TrackItemContext';

export interface TableButtonsProps {
    selectedFlatRows?: Row<ITrackItem>[];
    selectedRowIds?: Record<string, boolean>;
    setAllFilters?: (filters: unknown[]) => void;
    setSortBy?: (sortBy: SortingRule<ITrackItem>[]) => void;
    pageIndex?: number;
    pageSize?: number;
    fetchData?: (options: { pageIndex: number; pageSize: number; sortBy: SortingRule<ITrackItem>[] }) => void;
}

export const SearchDeleteButtons: React.FC<TableButtonsProps> = (props) => {
    const contextValues = useTrackItemContext();

    // Use props if provided, otherwise use context values
    const selectedFlatRows = props.selectedFlatRows || contextValues.selectedFlatRows;
    const selectedRowIds = props.selectedRowIds || contextValues.selectedRowIds;

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

    console.log('selectedRowIds.......', selectedRowIds);

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
        </HStack>
    );
};
