import { Spinner } from '@chakra-ui/react';
import { useColorModeValue } from '@chakra-ui/react';
import { chakra } from '@chakra-ui/react';

const SpinnerContainer = chakra('div', {
    baseStyle: {
        position: 'absolute',
        textAlign: 'center',

        opacity: '75%',
        borderRadius: 'md',
        padding: 6,
        width: '100%',
        height: '100%',
        minHeight: '100px',

        top: 0,
        left: 0,
        zIndex: 9,
        margin: 'auto auto',
    },
});

export const Loader = () => (
    <SpinnerContainer bg={useColorModeValue('white', 'black')}>
        <Spinner />
    </SpinnerContainer>
);
