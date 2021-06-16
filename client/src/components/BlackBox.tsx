import * as React from 'react';
import { Box, useColorModeValue } from '@chakra-ui/react';

export const BlackBox: React.FC<any> = ({ title, children, extra, ...rest }) => {
    return (
        <Box
            width="100%"
            borderWidth="1px"
            borderRadius="lg"
            overflow="hidden"
            p={4}
            bgColor={useColorModeValue('white', 'gray.900')}
            {...rest}
        >
            {children}
        </Box>
    );
};
