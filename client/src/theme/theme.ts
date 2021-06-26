import { extendTheme } from '@chakra-ui/react';
import { CalendarDayStyle, CalendarStyle } from '../components/Datepicker/CalendarStyle';
import { ButtonStyle } from './components/button';
import { FormLabelStyle } from './components/form-label';
import { InputStyle } from './components/input';
import { SelectStyle } from './components/select';
import { TableStyle } from './components/table';
import { TabsStyle } from './components/tabs';
import { TextareaStyle } from './components/textarea';

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
        Input: InputStyle,
        Textarea: TextareaStyle,
        Select: SelectStyle,
        FormLabel: FormLabelStyle,
    },
});
