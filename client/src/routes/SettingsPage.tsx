import * as React from 'react';

import { Layout } from 'antd';
import { connect } from 'dva';
import { MainLayout } from '../components/MainLayout/MainLayout';
import { SettingsFormContainer } from '../components/Settings/SettingsFormContainer';
const { Content } = Layout;

function Settings({ location }: any) {
    return (
        <MainLayout location={location}>
            <SettingsFormContainer />
        </MainLayout>
    );
}

export const SettingsPage = connect()(Settings);
