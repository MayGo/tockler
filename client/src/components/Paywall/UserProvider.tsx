import React, { useEffect, useMemo, useState, createContext } from 'react';
import firebase from 'firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { auth, firestore } from '../../utils/firebase.utils';
import { getSubscriptionFromLocalStorage, setSubscriptionToLocalStorage } from './Paywall.utils';

type UserState = {
    firebaseUser: firebase.User | null | undefined;
    error: firebase.auth.Error | undefined;
    loading: boolean;
    subscriptions: any[] | undefined;
    subscriptionsLoading: boolean;
    hasSubscription: boolean;
};

const noUserState = {
    firebaseUser: undefined,
    error: undefined,
    loading: true,
    subscriptions: [],
    subscriptionsLoading: false,
    hasSubscription: getSubscriptionFromLocalStorage(),
};

const UserContext = createContext<UserState>(noUserState);

const UserProvider = ({ children }: any) => {
    const [hasSubscription, setHasSubscription] = useState(getSubscriptionFromLocalStorage());
    const [user, loading, error] = useAuthState(auth);

    const subscriptionsRef = user?.uid
        ? firestore
              .collection('customers')
              .doc(user?.uid)
              .collection('subscriptions')
              .where('status', 'in', ['trialing', 'active'])
        : null;

    const [subscriptions, subscriptionsLoading] = useCollectionData(subscriptionsRef);

    useEffect(() => {
        if (subscriptions) {
            const subscribed = subscriptions.length > 0;
            console.info('Setting subscription status', subscribed);
            setHasSubscription(subscribed);
            setSubscriptionToLocalStorage(subscribed);
        }
    }, [subscriptions]);

    useEffect(() => {
        if (!user && !loading) {
            console.info('Setting subscription status when no user');
            setHasSubscription(false);
            setSubscriptionToLocalStorage(false);
        }
    }, [user, loading]);

    const value = {
        firebaseUser: user,
        error,
        loading,
        subscriptions,
        subscriptionsLoading,
        hasSubscription,
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const memValue = useMemo(() => value, Object.values(value));
    return <UserContext.Provider value={memValue}>{children}</UserContext.Provider>;
};

export { UserContext, UserProvider };
