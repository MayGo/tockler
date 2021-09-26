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
        signInOptions: [
            {
                provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
                signInMethod: firebase.auth.EmailAuthProvider.EMAIL_LINK_SIGN_IN_METHOD,
                forceSameDevice: false,
                emailLinkSignIn() {
                    return {
                        url: `https://tockler-app.firebaseapp.com/logintoapp`,
                        handleCodeInApp: true,
                    };
                },
            },
        ],
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
