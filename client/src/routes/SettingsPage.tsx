import * as React from 'react';

import { connect } from 'dva';
import { MainLayout } from '../components/MainLayout/MainLayout';
import { SettingsFormContainer } from '../components/Settings/SettingsFormContainer';

function Settings({ location }: any) {
    return (
        <MainLayout location={location}>
            <SettingsFormContainer />
        </MainLayout>
    );
}

export const SettingsPage = connect()(Settings);
