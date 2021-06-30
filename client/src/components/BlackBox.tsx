import * as React from 'react';
import { Box, useColorModeValue } from '@chakra-ui/react';

export const BlackBox: React.FC<any> = ({ children, ...rest }) => (
    <Box
        width="100%"
        borderRadius="lg"
        p={4}
        bgColor={useColorModeValue('gray.100', 'gray.900')}
        {...rest}
    >
        {children}
    </Box>
);
