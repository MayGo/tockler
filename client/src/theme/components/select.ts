import { mode } from '@chakra-ui/theme-tools';

export const SelectStyle = {
    baseStyle: () => ({
        field: {},
    }),

    variants: {
        outline: (props) => ({
            field: {
                bg: mode('white', 'gray.900')(props),
                borderColor: mode('gray.300', 'gray.400')(props),
            },
        }),
    },
};
