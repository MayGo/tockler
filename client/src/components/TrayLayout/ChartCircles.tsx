import { Box, Flex, Text, useColorModeValue } from '@chakra-ui/react';
import { shortTime } from '../../time.util';

const NO_VALUE = '-';

export const ChartCircles = ({ width, innerWidth, onlineTimeMs, lastSessionMs, currentSession }) => {
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
                borderColor={useColorModeValue('white', 'black')}
                borderWidth={1}
                zIndex={1}
            />
            <Box
                bg={useColorModeValue('white', 'gray.800')}
                w={width}
                h={width}
                borderRadius="full"
                position="absolute"
                top={0}
                left={0}
                bottom={0}
                right={0}
                margin="auto"
                boxShadow={useColorModeValue(
                    '0 0 0 4px rgba(251, 251, 251), inset 0 0 18px 4px rgba(229,231,235,0.50)',
                    '0 0 0 4px rgba(107,114,128,0.50), inset 0 0 18px 4px rgba(0,0,0,0.50)',
                )}
            />

            <Flex
                bg={useColorModeValue('gray.100', 'gray.900')}
                w={innerWidth}
                h={innerWidth}
                borderRadius="full"
                position="absolute"
                top={0}
                left={0}
                bottom={0}
                right={0}
                margin="auto"
                boxShadow={useColorModeValue(
                    '0 0 1px 1px #F3F4F6, inset 0 0 0 5px #F9FAFB;',
                    '0 0 1px 1px #111827, inset 0 0 0 5px rgba(107,114,128,0.50)',
                )}
                borderColor={useColorModeValue('gray.50', 'black')}
                borderWidth={1}
                zIndex={1}
                justifyContent="center"
                flexDirection="column"
            >
                <Text fontSize="xs" color={mainTextColor} mt={-2}>
                    Session Time
                </Text>
                <Text fontSize="2xl" mt={-1} color={useColorModeValue('blue.500', 'blue.500')}>
                    {currentSession}
                </Text>

                <Text fontSize="xs" color={mainTextColor} mt={2}>
                    Online Today
                </Text>
                <Text fontSize="4xl" color={useColorModeValue('gray.900', 'gray.100')} mt={-2}>
                    {onlineTimeMs}
                </Text>
                <Text fontSize="xs" color={mainTextColor} mt={2}>
                    Last Session
                </Text>
                <Text fontSize="2xl" color={mainTextColor} mt={-1}>
                    {lastSessionMs ? shortTime(lastSessionMs, { largest: 2, units: ['d', 'h', 'm', 's'] }) : NO_VALUE}
                </Text>
            </Flex>
        </Flex>
    );
};
