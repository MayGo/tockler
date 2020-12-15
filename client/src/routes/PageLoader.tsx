import React from 'react';
import { Flex } from 'reflexbox';
import { Spin } from 'antd';
import { Spinner } from '../components/Timeline/Timeline.styles';

export function PageLoader({ history }: any) {
    return (
        <Flex p={1}>
            <Spinner>
                <Spin />
            </Spinner>
        </Flex>
    );
}
