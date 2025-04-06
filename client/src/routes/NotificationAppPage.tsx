import { Box, Text } from '@chakra-ui/react';
import { memo, useEffect, useState } from 'react';
import { ShortTimeInterval } from '../components/TrayList/ShortTimeInterval';
import { Logger } from '../logger';
import { ElectronEventEmitter } from '../services/ElectronEventEmitter';

interface NotifyUserPayload {
    durationMs: number;
}

const NotificationAppPageTemp = () => {
    const [currentSession, setCurrentSession] = useState(0);

    useEffect(() => {
        const notifyUserReceiver = (payload) => {
            const data = payload as NotifyUserPayload;
            Logger.info('Notification received in client:', payload, data.durationMs);
            setCurrentSession(data.durationMs || 0);
        };

        ElectronEventEmitter.on('notifyUser', notifyUserReceiver);

        return () => {
            ElectronEventEmitter.off('notifyUser', notifyUserReceiver);
        };
    }, []);

    return (
        <Box
            p={1}
            bg={'brand.mainColor'}
            height="100vh"
            width="full"
            overflow="hidden"
            display="flex"
            justifyContent="center"
            alignItems="center"
        >
            <Text fontSize="sm" color="white" textAlign="center">
                {currentSession && <ShortTimeInterval totalMs={currentSession} />}
            </Text>
        </Box>
    );
};

export const NotificationAppPage = memo(NotificationAppPageTemp);
