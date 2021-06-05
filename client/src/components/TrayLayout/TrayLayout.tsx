import { Box } from '@chakra-ui/layout';
import React from 'react';
import { TrayMenu } from './TrayMenu';

export function TrayLayout({ children }: any) {
    return (
        <div>
            <Box w="100%">
                <TrayMenu />

                <Box>{children}</Box>
            </Box>
        </div>
    );
}
