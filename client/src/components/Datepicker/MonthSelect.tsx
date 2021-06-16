import { Select } from '@chakra-ui/select';

import React from 'react';

export const MonthSelect = ({ value, onChange }) => {
    const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ];
    return (
        <Select placeholder="Select month" value={value} onChange={onChange}>
            {months.map((month, idx) => (
                <option value={idx}>{month}</option>
            ))}
        </Select>
    );
};
