import * as React from 'react';

import { Layout } from 'antd';
import { connect } from 'dva';
import { MainLayout } from '../components/MainLayout/MainLayout';
import { TrayListContainer } from '../components/TrayList/TrayListContainer';
import { TimelineItemEditTrayContainer } from '../components/Timeline/TimelineItemEditTrayContainer';
const { Content } = Layout;

function Tray({ location }: any) {
    return (
        <MainLayout location={location}>
            <Content>
                <Layout>
                    <Content>
                        <TimelineItemEditTrayContainer />
                        <TrayListContainer />
                    </Content>
                </Layout>
            </Content>
        </MainLayout>
    );
}

export const TrayPage = connect()(Tray);

if (module.hot) {
    console.error('Hot reloading trays');
}
