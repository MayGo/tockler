import * as React from 'react';

import { Layout } from 'antd';
import { connect } from 'dva';
import { Box } from 'grid-styled';
import { TrayListContainer } from '../components/TrayList/TrayListContainer';
import { TimelineItemEditTrayContainer } from '../components/Timeline/TimelineItemEditTrayContainer';
import { TrayLayout } from '../components/TrayLayout/TrayLayout';

const { Content } = Layout;

function TrayApp({ location }: any) {
    return (
        <TrayLayout location={location}>
            <Content>
                <Layout>
                    <Content>
                        <Box pt={2}>
                            <TimelineItemEditTrayContainer />
                        </Box>
                        <TrayListContainer />
                    </Content>
                </Layout>
            </Content>
        </TrayLayout>
    );
}

export const TrayAppPage = connect()(TrayApp);
