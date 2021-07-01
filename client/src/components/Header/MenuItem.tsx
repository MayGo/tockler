import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Center } from '@chakra-ui/layout';
import { Button } from '@chakra-ui/button';

export const MenuItem = ({ to, icon, title }) => (
    <Box>
        <Button as={RouterLink} to={to} variant="ghost">
            <Center>
                <Box pr={2}>{icon}</Box>
                {title}
            </Center>
        </Button>
    </Box>
);
