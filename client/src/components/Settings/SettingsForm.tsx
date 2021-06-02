import React from 'react';
import { AnalyserForm } from './AnalyserForm';
import { AppForm } from './AppForm';
import { WorkForm } from './WorkForm';
import { ThemeSelect } from './ThemeSelect';
import { Flex, Box } from '@chakra-ui/layout';

export const SettingsForm = () => {
    return (
        <Flex p={1} flexDirection="column">
            <Box>
                <Box p={1} width="33%">
                    <ThemeSelect />
                </Box>
                <Box p={1} width="33%">
                    <WorkForm />
                </Box>

                <Box p={1} width="33%">
                    <AppForm />
                </Box>
                <Box p={1}>
                    <AnalyserForm />
                </Box>
            </Box>
        </Flex>
    );
};
