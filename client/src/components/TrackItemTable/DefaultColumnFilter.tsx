import { Input } from '@chakra-ui/react';
import React from 'react';
import { ToggleColumnFilter } from './ToggleColumnFilter';

export function DefaultColumnFilter({ column: { filterValue, preFilteredRows, setFilter } }) {
    return (
        <ToggleColumnFilter>
            <Input
                value={filterValue || ''}
                onChange={(e) => {
                    setFilter(e.target.value || undefined); // Set undefined to remove the filter entirely
                }}
                placeholder={``}
            />
        </ToggleColumnFilter>
    );
}
