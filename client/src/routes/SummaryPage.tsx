import * as React from 'react';
import { MainLayout } from '../components/MainLayout/MainLayout';
import { SummaryCalendar } from '../components/SummaryCalendar/SummaryCalendar';

export function SummaryPage({ location }: any) {
    return (
        <MainLayout location={location}>
            <SummaryCalendar />
        </MainLayout>
    );
}
