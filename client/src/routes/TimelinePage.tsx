import * as React from 'react';

import { Layout } from 'antd';
import { TimelineContainer } from '../components/Timeline/TimelineContainer';
import { SearchContainer } from '../components/Timeline/SearchContainer';
import { connect } from 'dva';
import { TrackItemTableContainer } from '../components/TrackItemTable/TrackItemTableContainer';
import { MainLayout } from '../components/MainLayout/MainLayout';
import { TimelineItemEditContainer } from '../components/Timeline/TimelineItemEditContainer';
const { Content } = Layout;

function Timeline({ location }: any) {
    return (
        <MainLayout location={location}>
            <Content>
                <Layout>
                    <Content>
                        <SearchContainer />

                        <TimelineContainer />

                        <TrackItemTableContainer />
                    </Content>
                </Layout>
            </Content>
        </MainLayout>
    );
}

export const TimelinePage = connect()(Timeline);
