import { Box } from '@chakra-ui/react';
import { useColorModeValue } from '@chakra-ui/react';
import { TrayMenu } from './TrayMenu';

export function TrayLayout({ children }: any) {
    return (
        <Box w="100%" minH="100vh" bg={useColorModeValue('gray.50', 'gray.700')}>
            <TrayMenu />

            <Box>{children}</Box>
        </Box>
    );
}
