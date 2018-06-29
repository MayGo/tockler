import * as React from 'react';

import { connect } from 'dva';
import { Box } from 'grid-styled';
import { TrayListContainer } from '../components/TrayList/TrayListContainer';
import { TimelineItemEditTrayContainer } from '../components/Timeline/TimelineItemEditTrayContainer';
import { TrayLayout } from '../components/TrayLayout/TrayLayout';

function TrayApp({ location, runningLogItem }: any) {
    return (
        <TrayLayout location={location}>
            {!runningLogItem && (
                <Box pt={2}>
                    <TimelineItemEditTrayContainer />
                </Box>
            )}
            <TrayListContainer />
        </TrayLayout>
    );
}

const mapStateToProps = ({ tray, loading }: any) => ({
    runningLogItem: tray.get('runningLogItem'),
    loading: loading.models.tray,
});
export const TrayAppPage = connect(mapStateToProps)(TrayApp);
