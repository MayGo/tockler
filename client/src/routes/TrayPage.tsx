import * as React from 'react';

import { connect } from 'dva';
import { MainLayout } from '../components/MainLayout/MainLayout';
import { TrayListContainer } from '../components/TrayList/TrayListContainer';
import { TimelineItemEditTrayContainer } from '../components/Timeline/TimelineItemEditTrayContainer';

function Tray({ location }: any) {
    return (
        <MainLayout location={location}>
            <TimelineItemEditTrayContainer />

            <TrayListContainer />
        </MainLayout>
    );
}

export const TrayPage = connect()(Tray);
