import { useMemo } from 'react';
import { Select } from '@chakra-ui/react';
import { ToggleColumnFilter } from './ToggleColumnFilter';

export function SelectColumnFilter({ column: { filterValue, setFilter, preFilteredRows, id } }) {
    // Calculate the options for filtering
    // using the preFilteredRows
    const options = useMemo(() => {
        const options = new Set();
        preFilteredRows.forEach((row) => {
            options.add(row.values[id]);
        });
        return [...options.values()] as string[];
    }, [id, preFilteredRows]);

    // Render a multi-select box
    return (
        <ToggleColumnFilter>
            <Select
                value={filterValue}
                onChange={(e) => {
                    setFilter(e.target.value || undefined);
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
