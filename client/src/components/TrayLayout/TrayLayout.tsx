import { Layout } from 'antd';
import React from 'react';
import { AuthBanner } from '../Auth';
import { TrayMenu } from './TrayMenu';

const { Content } = Layout;

export function TrayLayout({ children }: any) {
    return (
        <div>
            <Layout>
                <TrayMenu />
                <div style={{ height: 47 }} />
                <AuthBanner />
                <Content>{children}</Content>
            </Layout>
        </div>
    );
}
