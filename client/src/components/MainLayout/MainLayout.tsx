import { Box } from '@chakra-ui/layout';
import { Divider, useColorModeValue } from '@chakra-ui/react';
import React from 'react';
import { HeaderMenu } from './HeaderMenu';

export function MainLayout({ children }: any) {
    return (
        <Box w="100%">
            <HeaderMenu />
            <Divider borderColor={useColorModeValue('gray.100', 'gray.600')} />
            <Box>{children}</Box>
        </Box>
    );
}
