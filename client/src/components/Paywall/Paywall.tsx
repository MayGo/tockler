import * as React from 'react';
import { Box, useColorModeValue, Center, Flex, Button, Link, Text } from '@chakra-ui/react';
import paywallImage from '../../assets/paywall.png';
import { AuthCheck } from '../AuthCheck';
import { Loader } from '../Loader';
import { UserContext } from './UserProvider';
import { auth, firestore } from '../../utils/firebase.utils';
import { APP_RETURN_URL } from './Paywall.utils';
import ReactGA from 'react-ga4';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { addDoc, collection, getDocs, onSnapshot, query, where } from 'firebase/firestore';

const PremiumButton: React.FC<any> = ({ onRestoreClick, ...rest }) => {
    const { firebaseUser } = React.useContext(UserContext);
    const signOut = () => auth.signOut().then(() => console.log('signed out'));

    return (
        <Box position="absolute" top={400} textAlign="center">
            <Button bg="brand.mainColor" mt={14} w={185} size="lg" target="_blank" {...rest}>
                Unlock&nbsp;<b>Premium</b>
            </Button>
            {onRestoreClick && (
                <Text fontSize="xs" pt={3}>
                    <Link onClick={onRestoreClick}>Restore subscription</Link>
                </Text>
            )}
            {firebaseUser && (
                <>
                    <Text fontSize="xs" pt={3}>
                        Logged in as <b>{firebaseUser.email}</b>
                    </Text>
                    <Text fontSize="xs" pt={1}>
                        <Link onClick={signOut}>Logout</Link>
                    </Text>
                </>
            )}
        </Box>
    );
};
const PremiumInfo: React.FC<any> = () => (
    <>
        <Box>
            You are using <b>Basic</b> version of <b>Tockler</b>.
        </Box>
        <Box pt={3} pb={70}>
            Update to <b>Premium</b> to unlock the <b>full</b> experience.
        </Box>
    </>
);

interface PriceInterface {
    id: string;
    active: boolean;
    currency: string;
    unit_amount: number;
}
interface ProductInterface {
    id: string;
    active: boolean;
    prices: PriceInterface[];
}

const priceConverter = {
    toFirestore: (data: PriceInterface) => data,
    fromFirestore: (snap: any) => snap.data() as PriceInterface,
};

const AddSubsciptionButton: React.FC<any> = () => {
    const { firebaseUser } = React.useContext(UserContext);
    const [isLoading, setIsLoading] = React.useState(false);

    const productsRef = query(collection(firestore, 'products'), where('active', '==', true));

    const [products, loadingProducts] = useCollectionData(productsRef);

    const checkoutSessionsRef = firebaseUser?.uid
        ? collection(firestore, 'customers', `${firebaseUser?.uid}`, 'checkout_sessions')
        : null;

    const addSubscription = async () => {
        if (!checkoutSessionsRef) {
            return null;
        }

        try {
            ReactGA.event({
                category: 'Paywall',
                action: `User pressed Subscribe`,
            });

            setIsLoading(true);

            const product = products?.find((item) => item.active);

            if (!product) {
                console.error('No product found');
                alert('No product found!');
                return;
            }

            const pricesSnapshot = await getDocs(
                collection(firestore, 'products', `${product.id}`, 'prices').withConverter(priceConverter),
            );

            const prices: any[] = pricesSnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
            const priceId = prices?.find((price) => price.active)?.id;

            if (!priceId) {
                console.error('No price found');
                alert('No price found!');
                return;
            }

            const selectedPrice = {
                price: priceId,
                quantity: 1,
            };
            const checkoutSession = {
                //  automatic_tax: true,
                //  tax_id_collection: true,
                collect_shipping_address: false,
                line_items: [selectedPrice],
                success_url: APP_RETURN_URL,
                cancel_url: APP_RETURN_URL,
                mode: 'subscription',
                metadata: {
                    key: 'value',
                },
            };

            const resp = await addDoc(checkoutSessionsRef, checkoutSession);
            onSnapshot(resp, (snap) => {
                const data = snap.data();
                if (data) {
                    const { error, url } = data;

                    if (error) {
                        // Show an error to your customer and then inspect your function logs.
                        alert(`An error occured: ${error.message}`);
                        setIsLoading(false);
                    }
                    if (url) {
                        window.open(url, '_blank');
                        setIsLoading(false);
                    }
                } else {
                    console.info('No data');
                }
            });
        } catch (e) {
            alert(e);
            setIsLoading(false);
        }
    };

    if (isLoading || loadingProducts) {
        return <Loader />;
    }

    return (
        <>
            <PremiumButton onClick={addSubscription} />
        </>
    );
};

const STEP_BEGIN = 0;
const STEP_LOGIN = 1;
const STEP_RESTORE = 2;
const STEP_END = 3;

const StepTexts = { [STEP_BEGIN]: 'BEGIN', [STEP_LOGIN]: 'LOGIN', [STEP_RESTORE]: 'RESTORE', [STEP_END]: 'END' };

export const Paywall: React.FC<any> = ({ children, ...rest }) => {
    const [step, setStep] = React.useState(STEP_BEGIN);
    const { firebaseUser } = React.useContext(UserContext);

    React.useEffect(() => {
        if (firebaseUser) {
            setStep(STEP_END);
        } else {
            setStep(STEP_BEGIN);
        }
    }, [firebaseUser]);

    React.useEffect(() => {
        ReactGA.event({
            category: 'Paywall',
            action: `User went to ${StepTexts[step]} step`,
        });
    }, [step]);

    return (
        <Box
            borderRadius="lg"
            p={4}
            bgColor={useColorModeValue('gray.100', 'gray.900')}
            bgImage={paywallImage}
            bgPosition="center"
            boxShadow="md"
            bgRepeat="no-repeat"
            w={968}
            h={407}
            {...rest}
        >
            <Center h={400}>
                <Flex flexDirection="column" alignItems="center" maxWidth={400} ml={120}>
                    {step === STEP_BEGIN && (
                        <>
                            <PremiumInfo />
                            <PremiumButton
                                onClick={() => {
                                    setStep(STEP_LOGIN);
                                }}
                                onRestoreClick={() => {
                                    setStep(STEP_RESTORE);
                                }}
                            />
                        </>
                    )}

                    {step === STEP_LOGIN && (
                        <>
                            <AuthCheck>
                                <AddSubsciptionButton />
                            </AuthCheck>
                        </>
                    )}
                    {step === STEP_RESTORE && (
                        <>
                            <AuthCheck isRestore>
                                <AddSubsciptionButton />
                            </AuthCheck>
                        </>
                    )}
                    {step === STEP_END && (
                        <>
                            <PremiumInfo />
                            <AuthCheck>
                                <AddSubsciptionButton />
                            </AuthCheck>
                        </>
                    )}
                </Flex>
            </Center>
        </Box>
    );
};
