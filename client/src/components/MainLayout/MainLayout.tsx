import { Box } from 'reflexbox';
import { Layout } from 'antd';
import React, { useEffect, useState } from 'react';
import { HeaderMenu } from './HeaderMenu';
import LoginAlert from '../LoginAlert';
import { fetchLoginSettings } from '../../services/settings.api';

const { Footer, Content } = Layout;

export function MainLayout({ children, location }: any) {
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
    }, [location, location.pathname]);

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
