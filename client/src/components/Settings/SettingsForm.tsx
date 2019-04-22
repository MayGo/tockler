import * as React from 'react';
import { Flex, Box } from 'grid-styled';
import { Form, Button } from 'antd';
import { WorkForm } from './WorkForm';
import { AppForm } from './AppForm';
import { AnalyserFormContainer } from './AnalyserFormContainer';

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
                        <AnalyserFormContainer />
                    </Box>
                </Box>
            </Flex>
        </Form>
    );
};
