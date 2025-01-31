import { Select } from '@chakra-ui/react';
import { ITEM_TYPES } from '../utils';

export const TypeSelect = ({ value, onChange }) => {
    return (
        <Select value={value} onChange={onChange} w="200px">
            {Object.keys(ITEM_TYPES).map((key) => (
                <option key={key} value={key}>
                    {ITEM_TYPES[key]}
                </option>
            ))}
        </Select>
    );
};
