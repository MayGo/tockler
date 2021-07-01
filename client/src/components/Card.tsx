import * as React from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';

export const Card: React.FC<any> = ({ title, children, extra, ...rest }) => {
    return (
        <Box width="100%" borderWidth="1px" borderRadius="lg" overflow="hidden" p={4} {...rest}>
            <Flex justifyContent="space-between" pb={3}>
                <Text
                    fontWeight="bold"
                    textTransform="uppercase"
                    fontSize="lg"
                    letterSpacing="wide"
                    color="blue.600"
                >
                    {title}
                </Text>
                {extra}
            </Flex>
            {children}
        </Box>
    );
};
