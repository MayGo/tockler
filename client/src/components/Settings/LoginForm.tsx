import React, { useEffect, useState } from 'react';
import { Button, Card, Typography } from 'antd';
import { fetchLoginSettings, loginInExternalBrowser } from '../../services/settings.api';

const { Text } = Typography;

export const LoginForm = () => {
    // FIXME: This is duplicate code from client/src/components/MainLayout/MainLayout.tsx. Replace with a store to avoid fetching the same thing twice.
    const [isLoggedIn, setIsLoggedIn] = useState(false); // avoid first render where alert is shown

    const checkLoginSettings = async () => {
        const settings = await fetchLoginSettings();
        if (!settings) return;

        if (settings.token) {
            setIsLoggedIn(true);
        }
    };

    useEffect(() => {
        checkLoginSettings();
    }, []);

    return (
        <Card title="Login">
            <Button type="primary" block size="large" onClick={loginInExternalBrowser}>
                Login {isLoggedIn ? 'Again' : 'to GitStart'}
            </Button>
            <Text type="secondary">
                You must alreay have a GitStart account to login through here. Create an account at{' '}
                {/* eslint-disable-next-line */}
                <a>https://app.gitstart.com</a>.
            </Text>
        </Card>
    );
};
