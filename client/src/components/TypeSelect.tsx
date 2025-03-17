import { Select } from '@chakra-ui/react';
import { ITEM_TYPES } from '../utils';

export const TypeSelect = ({ value, onChange }) => {
    return (
        <Select
            value={value}
            onChange={onChange}
            w="200px"
            name="type-select"
            aria-label="Type Select"
            aria-expanded="false"
            aria-haspopup="listbox"
        >
            {Object.keys(ITEM_TYPES).map((key) => (
                <option key={key} value={key}>
                    {ITEM_TYPES[key]}
                </option>
            ))}
        </Select>
    );
};
