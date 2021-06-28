import { Box } from '@chakra-ui/layout';
import React from 'react';
import { TrayMenu } from './TrayMenu';

export function TrayLayout({ children }: any) {
    return (
        <Box w="100%" minH="100vh" bg="gray.700">
            <TrayMenu />

            <Box>{children}</Box>
        </Box>
    );
}
