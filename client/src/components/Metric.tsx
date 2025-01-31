import { Box, Text, useColorModeValue } from '@chakra-ui/react';

export const Metric = ({ title, value }) => {
    return (
        <Box flex={1}>
            <Box pb={1}>
                <Text fontSize="sm" color={useColorModeValue('gray.700', 'gray.300')}>
                    {title}
                </Text>
            </Box>
            <Box>
                <Text fontSize="x-large">{value}</Text>
            </Box>
        </Box>
    );
};
