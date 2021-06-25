import { mode } from '@chakra-ui/theme-tools';

export const FormLabelStyle = {
    baseStyle: props => ({
        color: mode('gray.700', 'gray.300')(props),
    }),
};
