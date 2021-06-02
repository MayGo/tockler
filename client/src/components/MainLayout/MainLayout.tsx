import { Box } from 'reflexbox';
import { Layout } from 'antd';
import React from 'react';
import { HeaderMenu } from './HeaderMenu';
import LoginAlert from '../LoginAlert';

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
                            <LoginAlert />
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
