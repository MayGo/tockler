import { mode } from '@chakra-ui/theme-tools';

export const SelectStyle = {
    baseStyle: () => ({
        field: {},
    }),

    variants: {
        outline: (props) => ({
            field: {
                bg: mode('gray.100', 'gray.900')(props),
                borderColor: mode('gray.300', 'gray.400')(props),
            },
        }),
    },
};
