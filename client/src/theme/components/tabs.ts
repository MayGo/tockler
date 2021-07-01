import { mode } from '@chakra-ui/theme-tools';

export const TabsStyle = {
    baseStyle: {
        tab: {
            textTransform: 'uppercase',
            fontWeight: 'bold',
            letterSpacing: '1px',
        },
    },

    variants: {
        enclosed: props => ({
            tab: {
                bg: mode('gray.100', 'gray.800')(props),
                color: mode('black', 'white')(props),
                _selected: {
                    bg: mode('gray.300', 'gray.500')(props),
                    color: mode('black', 'white')(props),
                },
                px: 6,
            },
        }),
    },
};
