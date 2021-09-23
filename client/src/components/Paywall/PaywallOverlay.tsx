import * as React from 'react';
import { Box, useMultiStyleConfig, Center } from '@chakra-ui/react';
import { Paywall } from './Paywall';
import { UserContext } from './UserProvider';

export const PaywallOverlay: React.FC<any> = ({ children, ...rest }) => {
    const styles = useMultiStyleConfig('Paywall', {});
    const { hasSubscription } = React.useContext(UserContext);

    if (hasSubscription) {
        return null;
    }

    return (
        <Box position="absolute" zIndex={10000} w="100%" h={'100%'} __css={styles.overlay} {...rest}>
            <Center h={800}>
                <Paywall />
            </Center>
        </Box>
    );
};
