import * as React from 'react';

import { Layout } from 'antd';
import { TimelineContainer } from '../components/Timeline/TimelineContainer';
import { SearchContainer } from '../components/Timeline/SearchContainer';
import { connect } from 'dva';
import { TrackItemTableContainer } from '../components/TrackItemTable/TrackItemTableContainer';
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
