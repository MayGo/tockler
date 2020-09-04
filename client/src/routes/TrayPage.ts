import React from 'react';

import { MainLayout } from '../components/MainLayout/MainLayout';
import { TrayAppPage } from './TrayAppPage';
/*
 * This Page is for testing purposes only
 */
export function TrayPage({ location }: any) {
    return (
        <MainLayout location={location}>
            <TrayAppPage />
        </MainLayout>
    );
}
