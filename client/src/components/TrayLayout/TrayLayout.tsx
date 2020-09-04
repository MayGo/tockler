import { Layout } from 'antd';
import React from 'react';
import { TrayMenu } from './TrayMenu';

const { Content } = Layout;

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
