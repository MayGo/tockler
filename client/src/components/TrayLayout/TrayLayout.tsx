import * as React from 'react';
import { Layout } from 'antd';
const { Footer, Content } = Layout;
import { TrayMenuContainer } from './TrayMenuContainer';

export function TrayLayout({ children }: any) {
    return (
        <div>
            <Layout>
                <TrayMenuContainer />
                <Content style={{ marginTop: 47 }}>{children}</Content>
                <Footer>Trimatech @ 2018</Footer>
            </Layout>
        </div>
    );
}
