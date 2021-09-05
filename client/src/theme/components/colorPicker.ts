import { mode } from '@chakra-ui/theme-tools';

export const ColorPickerStyle = {
    parts: ['color', 'swatch', 'popover', 'cover'],
    baseStyle: props => ({
        button: {
            padding: '4px',
            background: mode('white', 'black')(props),
            border: '1px solid',
            borderColor: mode('gray.300', 'gray.400')(props),
            borderRadius: 'md',
            cursor: 'pointer',
            position: 'relative',
        },
        color: {
            width: '30px',
            height: '30px',
            borderRadius: '4px',
            background: props.bgColor,
        },
    }),
};
