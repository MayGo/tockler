import { Button, HStack, Text } from '@chakra-ui/react';
import { Logger } from '../../logger';
import { deleteByIds } from '../../services/trackItem.api';
import { TableButtonsProps } from '../TrackItemTable/TrackItemTable.utils';

interface Props extends TableButtonsProps {
    refreshData: () => void;
}

export const SearchDeleteButtons: React.FC<Props> = (props) => {
    const { selectedFlatRows, selectedRowIds, refreshData } = props;

    const deleteTimelineItems = async (ids: number[]) => {
        console.log('Delete timeline items', ids);

        if (ids) {
            await deleteByIds(ids);
            Logger.debug('Deleted timeline items', ids);
        } else {
            Logger.error('No ids, not deleting from DB');
        }
    };

    const deleteSelectedItems = () => {
        console.log('selectedFlatRows...', selectedFlatRows);
        deleteTimelineItems(selectedFlatRows.map(({ original }) => original.id)).then(() => {
            refreshData();
        });
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
        </HStack>
    );
};
