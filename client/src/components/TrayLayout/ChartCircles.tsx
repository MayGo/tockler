import React from 'react';
import { Box, Flex, Text, useColorModeValue } from '@chakra-ui/react';
import { shortTime } from '../../time.util';

const NO_VALUE = '-';

export const ChartCircles = ({ width, innerWidth, onlineTimeMs, lastSessionMs }) => {
    const mainTextColor = useColorModeValue('gray.700', 'gray.300');
    return (
        <Flex
            position="absolute"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            w={width}
            h={width}
            pointerEvents="none"
        >
            <Box
                w={width}
                h={width}
                borderRadius="full"
                position="absolute"
                top={0}
                left={0}
                bottom={0}
                right={0}
                margin="auto"
                borderColor="black"
                borderWidth={1}
                zIndex={1}
            />
            <Box
                bg={useColorModeValue('gray.100', 'gray.800')}
                w={width}
                h={width}
                borderRadius="full"
                position="absolute"
                top={0}
                left={0}
                bottom={0}
                right={0}
                margin="auto"
                boxShadow="0 0 0 4px rgba(107,114,128,0.50), inset 0 0 18px 4px rgba(0,0,0,0.50)"
            />

            <Flex
                bg={useColorModeValue('white', 'gray.900')}
                w={innerWidth}
                h={innerWidth}
                borderRadius="full"
                position="absolute"
                top={0}
                left={0}
                bottom={0}
                right={0}
                margin="auto"
                boxShadow="0 0 1px 1px #111827, inset 0 0 0 5px rgba(107,114,128,0.50)"
                borderColor="black"
                borderWidth={1}
                zIndex={1}
                justifyContent="center"
                flexDirection="column"
            >
                <Text fontSize="md" color={mainTextColor} mt={5}>
                    Online Today
                </Text>
                <Text fontSize="4xl" color={useColorModeValue('gray.900', 'gray.100')}>
                    {shortTime(onlineTimeMs, { largest: 2, units: ['d', 'h', 'm'] }) || NO_VALUE}
                </Text>
                <Text fontSize="md" color={mainTextColor} pt={1}>
                    Last Session
                </Text>
                <Text fontSize="2xl" color={mainTextColor}>
                    {shortTime(lastSessionMs, { largest: 2, units: ['d', 'h', 'm'] }) || NO_VALUE}
                </Text>
            </Flex>
        </Flex>
    );
};
