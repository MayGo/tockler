import * as React from 'react';
import { Layout } from 'antd';
const { Content } = Layout;
import { TrayMenu } from './TrayMenu';

export function TrayLayout({ children }: any) {
    return (
        <div>
            <Layout>
                <TrayMenu />
                <Content style={{ marginTop: 47 }}>{children}</Content>
            </Layout>
        </div>
    );
}
