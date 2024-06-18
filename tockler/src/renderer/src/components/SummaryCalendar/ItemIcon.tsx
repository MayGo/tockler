import { Box } from '@chakra-ui/react';
import React from 'react';

export const ItemIcon = props => (
    <Box
        display="inline-flex"
        w={'16px'}
        h={'16px'}
        rounded={3}
        {...props}
        justifyContent="center"
        placeItems="center"
    />
);
