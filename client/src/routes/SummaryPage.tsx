import * as React from 'react';

import { connect } from 'dva';
import { MainLayout } from '../components/MainLayout/MainLayout';
import { SummaryCalendarContainer } from '../components/SummaryCalendar/SymmaryCalendarContainer';

function Summary({ location }: any) {
    return (
        <MainLayout location={location}>
            <SummaryCalendarContainer />
        </MainLayout>
    );
}

export const SummaryPage = connect()(Summary);
