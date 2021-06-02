import { Box } from 'reflexbox';
import { Layout } from 'antd';
import React, { useEffect, useState } from 'react';
import { TrayMenu } from './TrayMenu';
import LoginAlert from '../LoginAlert';
import { fetchLoginSettings } from '../../services/settings.api';

const { Content } = Layout;

export function TrayLayout({ children }: any) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

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
        <div>
            <Layout>
                <TrayMenu />
                <Content style={{ marginTop: 47 }}>
                    {!isLoggedIn ? (
                        <Box p={1}>
                            <LoginAlert />
                        </Box>
                    ) : null}
                    {children}
                </Content>
            </Layout>
        </div>
    );
}
