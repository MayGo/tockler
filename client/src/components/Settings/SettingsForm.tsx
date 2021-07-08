import { Box, Flex } from 'reflexbox';
import { Form } from 'antd';
import React from 'react';
import { AppForm } from './AppForm';
import { WorkForm } from './WorkForm';
import { LoginForm } from './LoginForm';
import { ThemeSelect } from './ThemeSelect';
import { LogList } from './LogList';
import BlacklistForm from './BlacklistForm';
import WhitelistForm from './WhitelistForm';

export const SettingsForm = () => {
    return (
        <Form>
            <Flex p={1} width={1} flexDirection="column">
                <Box>
                    <Box p={1} width={1 / 2}>
                        <ThemeSelect />
                    </Box>
                    <Box p={1} width={1 / 2}>
                        <LoginForm />
                    </Box>
                    <Box p={1} width={1 / 2}>
                        <WorkForm />
                    </Box>
                    <Box p={1} width={1 / 2}>
                        <AppForm />
                    </Box>
                    <Box p={1}>
                        <BlacklistForm />
                    </Box>
                    <Box p={1}>
                        <WhitelistForm />
                    </Box>
                    <Box p={1}>
                        <LogList />
                    </Box>
                </Box>
            </Flex>
        </Form>
    );
};
