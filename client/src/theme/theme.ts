import { extendTheme } from '@chakra-ui/react';
import { ButtonStyle } from './components/button';

export const theme = extendTheme({
    colors: {
        brand: {},
    },
    components: {
        Button: ButtonStyle,
    },
});
