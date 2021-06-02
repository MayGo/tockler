import * as React from 'react';
import { Box, Text } from '@chakra-ui/react';

export const Card: React.FC<any> = ({ title, children, extra, ...rest }) => {
    return (
        <Box width="100%" borderWidth="1px" borderRadius="lg" overflow="hidden" p={4} {...rest}>
            <Text
                fontWeight="bold"
                textTransform="uppercase"
                fontSize="lg"
                letterSpacing="wide"
                color="teal.600"
            >
                {title}
                {extra}
            </Text>
            {children}
        </Box>
    );
};
