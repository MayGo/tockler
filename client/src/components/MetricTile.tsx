import { Flex } from '@chakra-ui/react';

import { TileBox } from './TileBox';

export const MetricTile = ({ title, children, extra, ...rest }) => {
    return (
        <TileBox {...rest}>
            <Flex>{children}</Flex>
        </TileBox>
    );
};
