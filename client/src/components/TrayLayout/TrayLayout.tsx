import { Box } from '@chakra-ui/layout';
import { useColorModeValue } from '@chakra-ui/react';
import React from 'react';
import { TrayMenu } from './TrayMenu';

export function TrayLayout({ children }: any) {
    return (
        <Box w="100%" minH="100vh" bg={useColorModeValue('white', 'gray.700')}>
            <TrayMenu />

            <Box>{children}</Box>
        </Box>
    );
}
