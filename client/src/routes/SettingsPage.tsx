import * as React from 'react';

import { Layout } from 'antd';
import { connect } from 'dva';
import { MainLayout } from '../components/MainLayout/MainLayout';
const { Content } = Layout;

function Settings({ location }: any) {
    return (
        <MainLayout location={location}>
            <Content>
                <Layout>
                    <Content>Settings</Content>
                </Layout>
            </Content>
        </MainLayout>
    );
}

export const SettingsPage = connect()(Settings);
