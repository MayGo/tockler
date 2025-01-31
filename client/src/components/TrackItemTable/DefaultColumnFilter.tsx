import { Input } from '@chakra-ui/react';
import { ToggleColumnFilter } from './ToggleColumnFilter';

export function DefaultColumnFilter({ column: { filterValue, setFilter } }) {
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
