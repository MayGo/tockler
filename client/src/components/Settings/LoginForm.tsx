import React from 'react';
import { Button, Card, Typography } from 'antd';
import { loginInExternalBrowser } from '../../services/settings.api';

const { Text } = Typography;

export const LoginForm = () => {
    return (
        <Card title="Login">
            <Button type="primary" block size="large" onClick={loginInExternalBrowser}>
                Login to GitStart
            </Button>
            <Text type="secondary">
                You must alreay have a GitStart account to login through here. Create an account at{' '}
                {/* eslint-disable-next-line */}
                <a>https://app.gitstart.com</a>.
            </Text>
        </Card>
    );
};