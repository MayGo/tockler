import { CloseIcon } from '@chakra-ui/icons';
import { IconButton, Input, InputGroup, InputRightElement } from '@chakra-ui/react';
import { Column } from '@tanstack/react-table';
import { ITrackItem } from '../../@types/ITrackItem';

export function TextColumnFilter({ column }: { column: Column<ITrackItem> }) {
    const filterValue = column.getFilterValue();
    const value = typeof filterValue === 'string' ? filterValue : '';

    return (
        <InputGroup size="sm">
            <Input
                value={value}
                onChange={(e) => column.setFilterValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Escape' && column.setFilterValue(undefined)}
                placeholder="Filter…"
                aria-label={`Filter ${column.id}`}
                borderRadius="md"
            />
            {value && (
                <InputRightElement>
                    <IconButton
                        aria-label={`Clear ${column.id} filter`}
                        icon={<CloseIcon boxSize={2} />}
                        size="xs"
                        variant="ghost"
                        onClick={() => column.setFilterValue(undefined)}
                    />
                </InputRightElement>
            )}
        </InputGroup>
    );
}
