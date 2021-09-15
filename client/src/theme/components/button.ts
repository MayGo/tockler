import { mode, transparentize } from '@chakra-ui/theme-tools';

export const ButtonStyle = {
    baseStyle: {
        fontWeight: 'normal',
    },

    variants: {
        outline: props => ({
            borderColor: mode(`${props.colorScheme}.300`, `${props.colorScheme}.900`)(props),
        }),
        solid: props => ({
            bg: mode(`${props.colorScheme}.500`, `${props.colorScheme}.500`)(props),
            color: mode('white', 'white')(props),
            boxShadow: 'inset 0 -1px 0 0 rgba(0,0,0),inset 0 1px 0 0 rgba(255,255,255,0.30)',
            _hover: {
                bg: mode(
                    transparentize(`${props.colorScheme}.700`, 0.7)(props.theme),
                    transparentize(`${props.colorScheme}.500`, 0.7)(props.theme),
                )(props),
            },
        }),
    },
};
