import { Box } from '@chakra-ui/layout';
import React from 'react';
import { HeaderMenu } from './HeaderMenu';

export function MainLayout({ children, location }: any) {
    return (
        <Box w="100%">
            <HeaderMenu location={location} />

            <Box>{children}</Box>
            <Box p={3}>
                <a href="https://github.com/MayGo">MayGo</a> @ 2021
            </Box>
        </Box>
    );
}
