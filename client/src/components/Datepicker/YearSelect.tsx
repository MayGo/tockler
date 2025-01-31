import { Select } from '@chakra-ui/react';
import { range } from 'lodash';

export const YearSelect = ({ value, onChange }) => {
    var currentYear = new Date().getFullYear();
    const years = range(2016, currentYear + 1);

    return (
        <Select placeholder="Select year" value={value} onChange={onChange}>
            {years.map((year) => (
                <option key={year} value={year}>
                    {year}
                </option>
            ))}
        </Select>
    );
};
