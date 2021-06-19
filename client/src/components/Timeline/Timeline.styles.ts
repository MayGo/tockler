import { chakra } from '@chakra-ui/system';
import { transparentize } from '@chakra-ui/theme-tools';

export const SpinnerContainer = chakra('div', {
    baseStyle: {
        position: 'absolute',
        textAlign: 'center',
        bg: transparentize('black', 0.75),
        borderRadius: 'md',
        padding: 6,
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        zIndex: 10000,
        margin: 'auto auto',
    },
});
