import * as React from 'react';

import { Layout } from 'antd';
import { connect } from 'dva';
import { Box } from 'grid-styled';
import { TrayListContainer } from '../components/TrayList/TrayListContainer';
import { TimelineItemEditTrayContainer } from '../components/Timeline/TimelineItemEditTrayContainer';
import { TrayLayout } from '../components/TrayLayout/TrayLayout';

const { Content } = Layout;

function TrayApp({ location, runningLogItem }: any) {
    return (
        <TrayLayout location={location}>
            <Content>
                <Layout>
                    <Content>
                        {!runningLogItem && (
                            <Box pt={2}>
                                <TimelineItemEditTrayContainer />
                            </Box>
                        )}
                        <TrayListContainer />
                    </Content>
                </Layout>
            </Content>
        </TrayLayout>
    );
}

const mapStateToProps = ({ tray, loading }: any) => ({
    runningLogItem: tray.get('runningLogItem'),
    loading: loading.models.tray,
});
export const TrayAppPage = connect(mapStateToProps)(TrayApp);
