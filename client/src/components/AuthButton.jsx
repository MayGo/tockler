import firebase from 'firebase';
import 'firebase/auth';
import '@firebase/performance';
import React, { Suspense } from 'react';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';

import { CircularProgress } from '@chakra-ui/react';
import { auth } from '../utils/firebase.utils';

const SignInForm = () => {
    const uiConfig = {
        signInFlow: 'redirect',
        signInOptions: [firebase.auth.EmailAuthProvider.PROVIDER_ID, firebase.auth.GoogleAuthProvider.PROVIDER_ID],
        callbacks: {
            // Avoid redirects after sign-in.
            signInSuccessWithAuthResult: () => false,
        },
    };

    return <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={auth} />;
};

export const AuthButton = props => {
    return (
        <Suspense
            traceId={'firebase-user-wait'}
            fallback={<CircularProgress isIndeterminate color="brand.mainColor" />}
        >
            <SignInForm />
        </Suspense>
    );
};
