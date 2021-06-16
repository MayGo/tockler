import * as React from 'react';
import { Box, useColorModeValue } from '@chakra-ui/react';

export const CardBox: React.FC<any> = ({ title, children, extra, ...rest }) => {
    return (
        <Box
            width="100%"
            borderWidth="1px"
            borderRadius="lg"
            overflow="hidden"
            p={4}
            borderColor={useColorModeValue('gray.100', 'black')}
            bgColor={useColorModeValue('brand.100', 'gray.700')}
            {...rest}
        >
            {children}
        </Box>
    );
};
