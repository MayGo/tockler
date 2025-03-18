import { Box, Flex, useColorModeValue } from '@chakra-ui/react';
import { TrayMenu } from './TrayMenu';

interface TrayLayoutProps {
    children: React.ReactNode;
}

export function TrayLayout({ children }: TrayLayoutProps) {
    return (
        <Flex flexDirection="column" w="100%" h="100vh" overflow="hidden" bg={useColorModeValue('gray.50', 'gray.700')}>
            <TrayMenu />
            <Box flex="1" overflowY="auto">
                {children}
            </Box>
        </Flex>
    );
}
