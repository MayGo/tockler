// tslint:disable-next-line: no-submodule-imports

import { Logger } from '../../logger';
import { deleteByIds } from '../../services/trackItem.api';
import { useStoreActions } from '../../store/easyPeasy';
import { Button } from '@chakra-ui/react';
import { HStack, Text } from '@chakra-ui/react';

export const TrackItemTableButtons = ({ setAllFilters, setSortBy, selectedFlatRows, selectedRowIds }) => {
    const fetchTimerange = useStoreActions((actions) => actions.fetchTimerange);

    const deleteTimelineItems = async (ids) => {
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

            <Button variant="outline" onClick={() => setAllFilters([])}>
                Clear filters
            </Button>

            <Button
                variant="outline"
                onClick={() => {
                    setSortBy([]);
                    setAllFilters([]);
                }}
            >
                Clear filters and sorters
            </Button>
        </HStack>
    );
};
