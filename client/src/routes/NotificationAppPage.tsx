import { useEffect, useState, memo } from 'react';
import { EventEmitter } from '../services/EventEmitter';
import { Logger } from '../logger';
import { Center, Box } from '@chakra-ui/react';
import { Text } from '@chakra-ui/react';
import { ShortTimeInterval } from '../components/TrayList/ShortTimeInterval';

const NotificationAppPageTemp = () => {
    const [currentSession, setCurrentSession] = useState();

    useEffect(() => {
        const notifyUserReceiver = (payload) => {
            Logger.debug('notifyUserReceiver', payload);
            setCurrentSession(payload);
        };

        EventEmitter.on('notifyUser', notifyUserReceiver);

        return () => {
            EventEmitter.off('notifyUser', notifyUserReceiver);
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
