import * as React from 'react';
import { Box, Flex, Text, useColorModeValue } from '@chakra-ui/react';

export const CardBox: React.FC<any> = ({ title, children, extra, p = 4, divider, ...rest }) => {
    const titleColor = useColorModeValue('gray.900', 'white');
    const dividerColor = useColorModeValue('gray.200', 'gray.500');

    return (
        <Box
            width="100%"
            borderWidth="1px"
            borderRadius="lg"
            borderColor={useColorModeValue('gray.100', 'black')}
            bgColor={useColorModeValue('white', 'gray.700')}
            {...rest}
        >
            {title && (
                <Flex justifyContent="space-between" pr={p}>
                    <Text
                        fontWeight="bold"
                        textTransform="uppercase"
                        fontSize="md"
                        letterSpacing="wide"
                        color={titleColor}
                        p={p}
                        pb={divider ? 3 : 0}
                    >
                        {title}
                    </Text>
                    {extra}
                </Flex>
            )}
            {divider && <Box bg={dividerColor} h="1px" />}
            <Box p={p}>{children}</Box>
        </Box>
    );
};
