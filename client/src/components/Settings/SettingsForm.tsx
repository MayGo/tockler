import * as React from 'react';
import { Flex, Box } from 'grid-styled';
import { Form, Button } from 'antd';

import Config from 'electron-store';

import { useFormState } from 'react-use-form-state';
import { WorkForm } from './WorkForm'; //TODO rename
import { AppForm } from './AppForm';
const config = new Config();

interface IProps {
    handleSubmit: any;
}

interface IState {}

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
                    <Box p={1} />

                    <Flex p={1} justifyContent="flex-end">
                        <Button type="primary" htmlType="submit">
                            Save
                        </Button>
                    </Flex>
                </Box>
            </Flex>
        </Form>
    );
};
