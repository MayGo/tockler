import * as React from 'react';
import { Box, Flex, Text, useColorModeValue } from '@chakra-ui/react';

export const CardBox: React.FC<any> = ({ title, children, extra, ...rest }) => {
    const titleColor = useColorModeValue('black', 'white');
    return (
        <Box
            width="100%"
            borderWidth="1px"
            borderRadius="lg"
            overflow="hidden"
            p={4}
            borderColor={useColorModeValue('gray.100', 'black')}
            bgColor={useColorModeValue('gray.100', 'gray.700')}
            {...rest}
        >
            {title && (
                <Flex justifyContent="space-between" pb={3}>
                    <Text
                        fontWeight="bold"
                        textTransform="uppercase"
                        fontSize="md"
                        letterSpacing="wide"
                        color={titleColor}
                    >
                        {title}
                    </Text>
                    {extra}
                </Flex>
            )}
            {children}
        </Box>
    );
};
