import { mode } from '@chakra-ui/theme-tools';

export const ButtonStyle = {
    baseStyle: {
        fontWeight: 'normal',
    },

    variants: {
        outline: props => ({
            borderColor: mode('white', 'black')(props),
        }),
        solid: props => ({
            bg: mode('gray.500', 'gray.500')(props),
            boxShadow: 'inset 0 -1px 0 0 rgba(0,0,0),inset 0 1px 0 0 rgba(255,255,255,0.30)',
        }),
    },
};
