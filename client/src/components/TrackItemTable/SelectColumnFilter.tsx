import { Select } from '@chakra-ui/react';
import { Column } from '@tanstack/react-table';
import { ITrackItem } from '../../@types/ITrackItem';
import { ToggleColumnFilter } from './ToggleColumnFilter';

export function SelectColumnFilter({ column }: { column: Column<ITrackItem> }) {
    const uniqueValues = column.getFacetedUniqueValues();
    const options = Array.from(uniqueValues.keys());
    const filterValue = column.getFilterValue() || '';

    return (
        <ToggleColumnFilter>
            <Select
                value={filterValue as string}
                onChange={(e) => {
                    column.setFilterValue(e.target.value || undefined);
                }}
            >
                <option value="">All</option>
                {options.map((option, i) => (
                    <option key={i} value={option}>
                        {option}
                    </option>
                ))}
            </Select>
        </ToggleColumnFilter>
    );
}
