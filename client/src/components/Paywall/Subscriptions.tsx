import * as React from 'react';
import { Flex, Button, Text } from '@chakra-ui/react';
import { UserContext } from './UserProvider';
import { CardBox } from '../CardBox';
import { auth, firebaseApp } from '../../utils/firebase.utils';
import { APP_RETURN_URL } from './Paywall.utils';
import { getFunctions, httpsCallable } from 'firebase/functions';

const functionLocation = 'us-central1';

export const Subscriptions: React.FC<any> = () => {
    const { subscriptions, subscriptionsLoading } = React.useContext(UserContext);

    const [isLoadingPortal, setIsLoadingPortal] = React.useState(false);

    if (subscriptionsLoading || !subscriptions || subscriptions?.length === 0) {
        return null;
    }

    const subscription = subscriptions[0];

    console.info('subscription', subscription);

    const signOut = () => auth.signOut().then(() => console.log('signed out'));

    const openBillingSettings = async () => {
        try {
            setIsLoadingPortal(true);

            // Call billing portal function

            const functions = getFunctions(firebaseApp, functionLocation);
            const functionRef = httpsCallable(functions, 'ext-firestore-stripe-subscriptions-createPortalLink');

            const { data } = (await functionRef({ returnUrl: APP_RETURN_URL })) as any;

            window.open(data.url, '_blank');
            setIsLoadingPortal(false);
        } catch (e) {
            alert('Error opening customer portal. Make sure you are connected to internet.');
            console.error('Error loading portal', e);
            setIsLoadingPortal(false);
        }
    };

    return (
        <CardBox title="Subscription" divider>
            You have subscribed to <b>Premium</b>
            <Text py={3}>
                View invoices, update subscription and payment methods or cancel subscription:{' '}
                <Button
                    onClick={openBillingSettings}
                    aria-label="billing"
                    isLoading={isLoadingPortal}
                    mr={3}
                    variant="link"
                >
                    Open customer portal
                </Button>
            </Text>
            <Flex py={3} justifyContent="flex-end">
                <Button onClick={signOut} aria-label="Logout" colorScheme="red">
                    Logout
                </Button>
            </Flex>
        </CardBox>
    );
};
