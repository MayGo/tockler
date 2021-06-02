import { Box } from 'reflexbox';
import { Alert, Layout } from 'antd';
import React from 'react';
import { HeaderMenu } from './HeaderMenu';
import { loginInExternalBrowser } from '../../services/settings.api';

const { Footer, Content } = Layout;

export function MainLayout({ children, location }: any) {
    const isLoggedIn = false;

    return (
        <div>
            <Layout>
                <HeaderMenu location={location} />
                <Content>
                    {!isLoggedIn &&
                    (location.pathname === '/' ||
                        location.pathname === '/app/timeline' ||
                        location.pathname === '/app/timeline2' ||
                        location.pathname === '/app/summary' ||
                        location.pathname === '/app/search') ? (
                        <Box p={1}>
                            <Alert
                                type="warning"
                                message="You are currently not logged in to GitStart."
                                description="Please login so that your events are synced to GitStart."
                                showIcon
                                closeText="Login"
                                onClose={loginInExternalBrowser}
                            />
                        </Box>
                    ) : null}
                    {children}
                </Content>
                <Footer>
                    <a href="https://github.com/MayGo">MayGo</a> @ 2021
                </Footer>
            </Layout>
        </div>
    );
}
