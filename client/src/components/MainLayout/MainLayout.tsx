import { Box } from '@chakra-ui/layout';

import React from 'react';
import { HeaderMenu } from './HeaderMenu';

export function MainLayout({ children }: any) {
    return (
        <Box w="100%">
            <HeaderMenu />
            <Box>{children}</Box>
        </Box>
    );
}
