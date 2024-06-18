import * as React from 'react';
import { Box, useColorModeValue } from '@chakra-ui/react';

export const TileBox: React.FC<any> = ({ children, ...rest }) => (
    <Box
        width="100%"
        borderWidth={1}
        borderRadius="lg"
        p={4}
        borderColor={useColorModeValue('gray.300', 'gray.500')}
        {...rest}
    >
        {children}
    </Box>
);
