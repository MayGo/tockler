import { Box, Flex } from 'reflexbox';
import { Form } from 'antd';
import React from 'react';
import { AnalyserForm } from './AnalyserForm';
import { AppForm } from './AppForm';
import { WorkForm } from './WorkForm';
import { ThemeSelect } from './ThemeSelect';

export const SettingsForm = () => {
    return (
        <Form>
            <Flex p={1} width={1} flexDirection="column">
                <Box>
                    <Box p={1} width={1 / 3}>
                        <ThemeSelect />
                    </Box>
                    <Box p={1} width={1 / 3}>
                        <WorkForm />
                    </Box>

                    <Box p={1} width={1 / 3}>
                        <AppForm />
                    </Box>
                    <Box p={1}>
                        <AnalyserForm />
                    </Box>
                </Box>
            </Flex>
        </Form>
    );
};
