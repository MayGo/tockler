import { Flex } from '@chakra-ui/react';
import * as React from 'react';
import { TileBox } from './TileBox';

export const MetricTile: React.FC<any> = ({ title, children, extra, ...rest }) => {
    return (
        <TileBox {...rest}>
            <Flex>{children}</Flex>
        </TileBox>
    );
};
