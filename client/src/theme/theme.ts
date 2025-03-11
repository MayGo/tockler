import { extendTheme } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';
import { CalendarDayStyle, CalendarStyle } from '../components/Datepicker/CalendarStyle';
import { getThemeFromStorage } from '../services/settings.api';
import { THEMES } from '../store/theme.util';
import { ButtonStyle } from './components/button';
import { ColorPickerStyle } from './components/colorPicker';
import { FormLabelStyle } from './components/form-label';
import { InputStyle } from './components/input';
import { SelectStyle } from './components/select';
import { TableStyle } from './components/table';
import { TabsStyle } from './components/tabs';
import { TextareaStyle } from './components/textarea';
import { MAIN_THEME_COLOR } from './theme.utils';

const savedTheme = getThemeFromStorage();
const initialColorMode = savedTheme || THEMES.LIGHT;

console.info('INITIAL THEME', initialColorMode);

const config = {
    initialColorMode: initialColorMode,
    useSystemColorMode: false,
};

export const theme = extendTheme({
    config,
    styles: {
        global: (props) => ({
            'html, body': {
                // color: mode('gray.600', 'white')(props),
                bg: mode('gray.50', 'gray.800')(props),
                fontFamily:
                    'Inter, -apple-system, system-ui, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";',
            },
        }),
    },
    colors: {
        brand: {
            mainColor: MAIN_THEME_COLOR,
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
        ColorPicker: ColorPickerStyle,
    },
});
