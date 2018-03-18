import * as React from 'react';

import { Layout } from 'antd';
import { connect } from 'dva';
import { MainLayout } from '../components/MainLayout/MainLayout';
const { Content } = Layout;

function Summary({ location }: any) {
    return (
        <MainLayout location={location}>
            <Content>
                <Layout>
                    <Content>Summary</Content>
                </Layout>
            </Content>
        </MainLayout>
    );
}

export const SummaryPage = connect()(Summary);
