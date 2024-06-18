import { Checkbox } from '@chakra-ui/checkbox';
import React from 'react';

export const IndeterminateCheckbox = ({ indeterminate, ...rest }) => {
    return <Checkbox isIndeterminate={indeterminate} {...rest} />;
};
