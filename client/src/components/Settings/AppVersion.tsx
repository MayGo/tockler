import { Box, Text } from '@chakra-ui/react';
import { use } from 'react';
import '../../types/electron-bridge';

export const AppVersion = () => {
    // Get app version from the electron bridge
    const appVersion = use(window?.electronBridge?.appVersion?.()) || '-';

    return (
        <Box width="100%" pt={2}>
            <Text fontSize="sm" color="gray.500">
                Version: {appVersion}
            </Text>
        </Box>
    );
};
