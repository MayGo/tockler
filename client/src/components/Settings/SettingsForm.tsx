import { Box, Flex } from '@rebass/grid';
import { Form } from 'antd';
import React from 'react';
import { AnalyserForm } from './AnalyserForm';
import { AppForm } from './AppForm';
import { WorkForm } from './WorkForm';

export const SettingsForm = () => {
    return (
        <Form>
            <Flex p={1} w={1} flexDirection="column">
                <Box>
                    <Box p={1} w={1 / 3}>
                        <WorkForm />
                    </Box>

                    <Box p={1} w={1 / 3}>
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
