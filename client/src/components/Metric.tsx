import * as React from 'react';
import { Box, Text } from '@chakra-ui/react';

export const Metric: React.FC<any> = ({ title, value }) => {
    return (
        <Box flex={1}>
            <Box pb={1}>
                <Text fontSize="sm" color="gray.300">
                    {title}
                </Text>
            </Box>
            <Box>
                <Text fontSize="x-large" color="white">
                    {value}
                </Text>
            </Box>
        </Box>
    );
};
