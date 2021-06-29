import { mode } from '@chakra-ui/theme-tools';

export const InputStyle = {
    baseStyle: props => ({
        field: {
            _placeholder: {
                color: mode('gray.500', 'gray.400')(props),
            },
        },
    }),

    variants: {
        outline: props => ({
            field: {
                bg: mode('gray.100', 'gray.900')(props),
                borderColor: mode('gray.300', 'gray.400')(props),
            },
        }),
    },
};
