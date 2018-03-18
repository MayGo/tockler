import * as React from 'react';

import { Layout } from 'antd';
import { connect } from 'dva';
import { MainLayout } from '../components/MainLayout/MainLayout';
const { Content } = Layout;

function Tray({ location }: any) {
    return (
        <MainLayout location={location}>
            <Content>
                <Layout>
                    <Content>Tray</Content>
                </Layout>
            </Content>
        </MainLayout>
    );
}

export const TrayPage = connect()(Tray);
