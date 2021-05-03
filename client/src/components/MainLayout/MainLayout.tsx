import { Layout } from 'antd';
import React from 'react';
import { HeaderMenu } from './HeaderMenu';

const { Footer, Content } = Layout;

export function MainLayout({ children, location }: any) {
    return (
        <div>
            <Layout>
                <HeaderMenu location={location} />
                <Content>{children}</Content>
                <Footer>
                    <a href="https://github.com/MayGo">MayGo</a> @ 2021
                </Footer>
            </Layout>
        </div>
    );
}
