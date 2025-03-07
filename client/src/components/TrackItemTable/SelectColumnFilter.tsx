import { Select } from '@chakra-ui/react';
import { useMemo } from 'react';
import { ToggleColumnFilter } from './ToggleColumnFilter';

export function SelectColumnFilter({ column }) {
    // Calculate the options for filtering
    // using the preFilteredRows
    const options = useMemo(() => {
        const options = new Set();
        column.getFacetedUniqueValues().forEach((count, value) => {
            options.add(value);
        });
        return [...options.values()] as string[];
    }, [column]);

    const filterValue = column.getFilterValue() || '';

    // Render a multi-select box
    return (
        <ToggleColumnFilter>
            <Select
                value={filterValue}
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
