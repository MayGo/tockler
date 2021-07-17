import { extendTheme } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';

export const MAIN_THEME_COLOR = '#7C3AED';

export const theme = extendTheme({
  styles: {
    global: props => ({
      'html, body': {
        // color: mode('gray.600', 'white')(props),
        bg: mode('gray.50', 'gray.900')(props),
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
});
