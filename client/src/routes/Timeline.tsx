import * as React from 'react';

import { Layout } from 'antd';
import { TimelineContainer } from '../components/Timeline/TimelineContainer';
import { SearchContainer } from '../components/Timeline/SearchContainer';

const { Content, Header, Footer } = Layout;

interface IPortalProps {
    collapse: boolean;
}

class Portal extends React.Component<IPortalProps, any> {
    constructor(props: IPortalProps) {
        super(props);
    }

    public render() {
        return (
            <Layout>
                <Header>Header</Header>
                <Content>
                    <Layout>
                        <Content>
                            <SearchContainer />
                            <TimelineContainer />
                        </Content>
                    </Layout>
                </Content>
                <Footer>Footer</Footer>
            </Layout>
        );
    }
}

export default Portal;
