import * as React from 'react';

import { connect } from 'dva';
import { MainLayout } from '../components/MainLayout/MainLayout';
import { SettingsForm } from '../components/Settings/SettingsForm';

function Settings({ location }: any) {
    return (
        <MainLayout location={location}>
            <SettingsForm />
        </MainLayout>
    );
}

export const SettingsPage = connect()(Settings);
