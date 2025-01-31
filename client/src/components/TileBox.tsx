import { Box, useColorModeValue } from '@chakra-ui/react';

export const TileBox = ({ children, ...rest }) => (
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
