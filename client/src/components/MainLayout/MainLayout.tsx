import * as React from 'react';
import { Layout } from 'antd';
const { Footer, Content } = Layout;
import { HeaderMenu } from './HeaderMenu';

export function MainLayout({ children, location }: any) {
    return (
        <div>
            <Layout>
                <HeaderMenu location={location} />
                <Content>{children}</Content>
                <Footer>Trimatech @ 2018</Footer>
            </Layout>
        </div>
    );
}
