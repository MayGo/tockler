import { Box } from 'reflexbox';
import { Layout } from 'antd';
import React from 'react';
import { TrayMenu } from './TrayMenu';
import LoginAlert from '../LoginAlert';

const { Content } = Layout;

export function TrayLayout({ children }: any) {
    const isLoggedIn = false;

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
