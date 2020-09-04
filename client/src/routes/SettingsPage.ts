import React from 'react';

import { MainLayout } from '../components/MainLayout/MainLayout';
import { SettingsForm } from '../components/Settings/SettingsForm';

export function SettingsPage({ location }: any) {
    return (
        <MainLayout location={location}>
            <SettingsForm />
        </MainLayout>
    );
}
