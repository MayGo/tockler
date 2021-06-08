import { Select } from '@chakra-ui/select';
import { range } from 'lodash';
import React from 'react';

export const YearSelect = ({ value, onChange }) => {
    var currentYear = new Date().getFullYear();
    const years = range(2016, currentYear + 1);
    return (
        <Select placeholder="Select year" value={value} onChange={onChange}>
            {years.map(year => (
                <option value={year}>{year}</option>
            ))}
        </Select>
    );
};
