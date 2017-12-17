import * as React from 'react';

import { DatePicker, Layout, Breadcrumb } from 'antd';
import { TimelineContainer } from '../components/Timeline/TimelineContainer';

const { Content, Header, Footer } = Layout;
const { MonthPicker, RangePicker, WeekPicker } = DatePicker;

interface IPortalProps {
    collapse: boolean;
}

function onChange(date, dateString) {
    console.log(date, dateString);
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
                            <RangePicker onChange={onChange} />
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
