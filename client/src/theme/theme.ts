import { extendTheme } from '@chakra-ui/react';
import { CalendarDayStyle, CalendarStyle } from '../components/Datepicker/CalendarStyle';
import { ButtonStyle } from './components/button';
import { FormLabelStyle } from './components/form-label';
import { InputStyle } from './components/input';
import { SelectStyle } from './components/select';
import { TableStyle } from './components/table';
import { TabsStyle } from './components/tabs';
import { TextareaStyle } from './components/textarea';
import { getThemeFromStorage } from '../services/settings.api';
import { THEMES } from '../store/theme.util';

const savedTheme = getThemeFromStorage();
const initialColorMode = savedTheme?.name || THEMES.LIGHT;

console.info('INITIAL THEME', initialColorMode);

const config = {
    initialColorMode: initialColorMode,
    useSystemColorMode: false,
};
export const theme = extendTheme({
    config,
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
