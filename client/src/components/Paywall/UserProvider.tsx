import React, { useEffect, useMemo, useState, createContext } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { auth, firestore } from '../../utils/firebase.utils';
import {
    getSubscriptionFromLocalStorage,
    getTrialFromLocalStorage,
    setSubscriptionToLocalStorage,
    setTrialToLocalStorage,
} from './Paywall.utils';
import { findFirstTrackItem } from '../../services/trackItem.api';
import moment from 'moment';
import { collection, doc, query, where } from 'firebase/firestore';
import { User } from 'firebase/auth';

type UserState = {
    firebaseUser: User | null | undefined;
    error: Error | undefined;
    loading: boolean;
    subscriptions: any[] | undefined;
    subscriptionsLoading: boolean;
    hasSubscription: boolean;
    hasTrial: boolean;
    trialDays: number;
};

const noUserState = {
    firebaseUser: undefined,
    error: undefined,
    loading: true,
    subscriptions: [],
    subscriptionsLoading: false,
    hasSubscription: getSubscriptionFromLocalStorage(),
    hasTrial: getTrialFromLocalStorage(),
    trialDays: 0,
};

const UserContext = createContext<UserState>(noUserState);

const UserProvider = ({ children }: any) => {
    const [trialDays, setTrialDays] = useState(0);
    const [hasTrial, setHasTrial] = useState(getTrialFromLocalStorage());
    const [hasSubscription, setHasSubscription] = useState(getSubscriptionFromLocalStorage());
    const [user, loading, error] = useAuthState(auth);

    const subRef = collection(firestore, 'customers', `${user?.uid}`, 'subscriptions');

    const subscriptionsRef = user?.uid ? query(subRef, where('status', 'in', ['trialing', 'active'])) : null;

    const [subscriptions, subscriptionsLoading] = useCollectionData(subscriptionsRef);

    useEffect(() => {
        const fetchData = async () => {
            const items = await findFirstTrackItem();
            const firstItem = items.length > 0 ? items[0] : {};

            const beginDate = moment(firstItem.beginDate);
            const now = moment();
            const TRIAL_DAYS = 30;

            const daysUsed = now.diff(beginDate, 'days');
            const trialing = daysUsed <= TRIAL_DAYS;
            setTrialDays(TRIAL_DAYS - daysUsed);
            setHasTrial(trialing);
            setTrialToLocalStorage(trialing);
        };

        fetchData();
    }, []);

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
        hasTrial,
        trialDays,
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const memValue = useMemo(() => value, Object.values(value));
    return <UserContext.Provider value={memValue}>{children}</UserContext.Provider>;
};

export { UserContext, UserProvider };
