import React, { useCallback, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Loader } from './Loader';
import { AuthButton } from './AuthButton';
import { Box } from '@chakra-ui/layout';
import { auth } from '../utils/firebase.utils';
import { Logger } from '../logger';
import { EventEmitter } from '../services/EventEmitter';
import { getEmailFromLocalStorage } from './Paywall/Paywall.utils';

export const AuthCheck = ({ children, isRestore = false }) => {
    const [user, loading, error] = useAuthState(auth);

    const gotLoginUrl = useCallback((query) => {
        Logger.debug('event-login-url:', query);
        const email = getEmailFromLocalStorage();
        if (email) {
            auth.signInWithEmailLink(email, query).catch((err) => {
                Logger.error('Error signing in with email link:', err.code, err);
            });
        } else {
            alert('There was no email saved to login! ');
        }
    }, []);

    useEffect(() => {
        EventEmitter.on('event-login-url', gotLoginUrl);

        return () => {
            EventEmitter.off('event-login-url', gotLoginUrl);
        };
    }, [gotLoginUrl]);

    if (loading) {
        return <Loader />;
    }

    if (!user) {
        return <AuthButton isRestore={isRestore} />;
    }

    if (error) {
        return <Box p={3}>{error?.toString()}</Box>;
    }

    return children;
};
