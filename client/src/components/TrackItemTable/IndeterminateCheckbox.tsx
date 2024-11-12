import { Checkbox } from '@chakra-ui/react';
import React from 'react';

export const IndeterminateCheckbox = ({ indeterminate, ...rest }) => {
    return <Checkbox isIndeterminate={indeterminate} {...rest} />;
};
