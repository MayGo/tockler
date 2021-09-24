import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Loader } from './Loader';
import { AuthButton } from './AuthButton';
import { Box } from '@chakra-ui/layout';
import { auth } from '../utils/firebase.utils';

export const AuthCheck = ({ children }) => {
    const [user, loading, error] = useAuthState(auth);

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
