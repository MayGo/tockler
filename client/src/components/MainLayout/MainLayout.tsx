import { Box } from '@chakra-ui/react';

import { Outlet } from 'react-router-dom';
import { HeaderMenu } from './HeaderMenu';

export function MainLayout() {
    return (
        <Box w="100%">
            <HeaderMenu />
            <Box>
                <Outlet />
            </Box>
        </Box>
    );
}
