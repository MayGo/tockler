import { extendTheme } from '@chakra-ui/react';
import { CalendarDayStyle, CalendarStyle } from '../components/Datepicker/CalendarStyle';
import { ButtonStyle } from './components/button';
import { TableStyle } from './components/table';
import { TabsStyle } from './components/tabs';

export const theme = extendTheme({
    colors: {
        brand: {
            mainColor: '#7C3AED',
        },
    },
    components: {
        Button: ButtonStyle,
        Tabs: TabsStyle,
        Calendar: CalendarStyle,
        CalendarDay: CalendarDayStyle,
        Table: TableStyle,
    },
});
