import * as React from 'react';
import { Box, useColorModeValue, Center, Flex, Button, Link } from '@chakra-ui/react';
import paywallImage from '../../assets/paywall.png';

const PAYMENT_LINK = process.env.REACT_APP_STIPE_PREMIUM_PAYMENT_LINK || '';

export const Paywall: React.FC<any> = ({ children, ...rest }) => (
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
            <Flex flexDirection="column" alignItems="center">
                <Box>
                    You are using <b>Basic</b> version of <b>Tockler</b>.
                </Box>
                <Box pt={3}>
                    Update to <b>Premium</b> to unlock the <b>full</b> experience.
                </Box>
                <Button
                    as={Link}
                    bg="brand.mainColor"
                    mt={14}
                    w={185}
                    size="lg"
                    href={PAYMENT_LINK}
                    target="_blank"
                >
                    Unlock&nbsp;<b>Premium</b>
                </Button>
            </Flex>
        </Center>
    </Box>
);
