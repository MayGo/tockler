import { Select } from '@chakra-ui/react';
import { Column } from '@tanstack/react-table';
import { useMemo } from 'react';
import { ITrackItem } from '../../@types/ITrackItem';

export function SelectColumnFilter({ column }: { column: Column<ITrackItem> }) {
    const uniqueValues = column.getFacetedUniqueValues();
    const options = useMemo(
        () =>
            [...uniqueValues.entries()]
                .filter(([value]) => typeof value === 'string' && value)
                .sort(([a], [b]) => String(a).localeCompare(String(b))),
        [uniqueValues],
    );
    const filterValue = column.getFilterValue();

    return (
        <Select
            size="sm"
            borderRadius="md"
            aria-label={`Filter ${column.id}`}
            value={typeof filterValue === 'string' ? filterValue : ''}
            onChange={(e) => column.setFilterValue(e.target.value || undefined)}
        >
            <option value="">All</option>
            {options.map(([value, count]) => (
                <option key={value} value={value}>
                    {value} ({count})
                </option>
            ))}
        </Select>
    );
}
