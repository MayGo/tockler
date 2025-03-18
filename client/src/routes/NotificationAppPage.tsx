import { Box, Text } from '@chakra-ui/react';
import { memo, useEffect, useState } from 'react';
import { ShortTimeInterval } from '../components/TrayList/ShortTimeInterval';
import { Logger } from '../logger';
import { ElectronEventEmitter } from '../services/ElectronEventEmitter';

const NotificationAppPageTemp = () => {
    const [currentSession, setCurrentSession] = useState();

    useEffect(() => {
        const notifyUserReceiver = (payload) => {
            Logger.debug('notifyUserReceiver', payload);
            setCurrentSession(payload);
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
