import { Box, Center, Text } from '@chakra-ui/react';
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Box p={1} bg={'brand.mainColor'}>
            <Center>
                <Text fontSize="small" color="white">
                    {currentSession && <ShortTimeInterval totalMs={currentSession} />}
                </Text>
            </Center>
        </Box>
    );
};

export const NotificationAppPage = memo(NotificationAppPageTemp);
