import { Box, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import '../../types/electron-bridge';

export const AppVersion = () => {
    const [appVersion, setAppVersion] = useState('-');

    useEffect(() => {
        const fetchVersion = async () => {
            try {
                if (window?.electronBridge?.appVersion) {
                    const version = await window.electronBridge.appVersion();
                    setAppVersion(version);
                }
            } catch (error) {
                console.error('Error fetching app version:', error);
            }
        };

        fetchVersion();
    }, []);

    return (
        <Box width="100%" pt={2}>
            <Text fontSize="sm" color="gray.500" textAlign="right">
                Version: {appVersion}
            </Text>
        </Box>
    );
};
