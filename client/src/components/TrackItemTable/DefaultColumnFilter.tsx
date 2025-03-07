import { Input } from '@chakra-ui/react';
import { ToggleColumnFilter } from './ToggleColumnFilter';

export function DefaultColumnFilter({ column }) {
    const filterValue = column.getFilterValue() || '';

    return (
        <ToggleColumnFilter>
            <Input
                value={filterValue}
                onChange={(e) => {
                    column.setFilterValue(e.target.value || undefined); // Set undefined to remove the filter entirely
                }}
                placeholder={``}
            />
        </ToggleColumnFilter>
    );
}
