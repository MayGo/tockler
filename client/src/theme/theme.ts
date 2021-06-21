import { extendTheme } from '@chakra-ui/react';
import { ButtonStyle } from './components/button';
import { TabsStyle } from './components/tabs';

export const theme = extendTheme({
    colors: {
        brand: {},
    },
    components: {
        Button: ButtonStyle,
        Tabs: TabsStyle,
    },
});
