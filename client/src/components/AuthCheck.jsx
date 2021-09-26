import React, { useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Loader } from './Loader';
import { AuthButton } from './AuthButton';
import { Box } from '@chakra-ui/layout';
import { auth } from '../utils/firebase.utils';
import { Logger } from '../logger';
import { EventEmitter } from '../services/EventEmitter';

export const AuthCheck = ({ children }) => {
    const [user, loading, error] = useAuthState(auth);

    useEffect(() => {
        const gotLoginUrl = query => {
            Logger.debug('event-login-url:', query);
            auth.signInWithEmailLink('maigo.erit@gmail.com', query).catch(err => {
                Logger.error('Error signing in with email link:', err.code, err);
            });
        };

        EventEmitter.on('event-login-url', gotLoginUrl);

        return () => {
            EventEmitter.off('event-login-url', gotLoginUrl);
        };
    }, []);

    if (loading) {
        return <Loader />;
    }

    if (!user) {
        return <AuthButton />;
    }

    if (error) {
        return <Box p={3}>{error}</Box>;
    }

    return children;
};
