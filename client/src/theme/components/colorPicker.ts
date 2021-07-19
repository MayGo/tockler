import { mode } from '@chakra-ui/theme-tools';

export const ColorPickerStyle = {
    parts: ['color', 'swatch', 'popover', 'cover'],
    baseStyle: props => ({
        color: {
            width: '30px',
            height: '30px',
            borderRadius: '4px',
            background: props.pickerColor,
        },
        swatch: {
            padding: '4px',
            background: mode('white', 'black')(props),
            border: '1px solid',
            borderColor: mode('gray.300', 'gray.400')(props),
            borderRadius: 'md',
            cursor: 'pointer',
            position: 'relative',
        },
        popover: {
            position: 'absolute',
            zIndex: '2',
            right: '0',
        },
        cover: {
            position: 'fixed',
            top: '0px',
            right: '0px',
            bottom: '0px',
            left: '0px',
        },
    }),
};
