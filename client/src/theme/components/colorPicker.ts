import { mode } from '@chakra-ui/theme-tools';

export const ColorPickerStyle = {
    parts: ['color', 'swatch', 'popover', 'cover'],
    baseStyle: props => ({
        color: {
            width: '30px',
            height: '30px',
            borderRadius: 'md',
            background: props.pickerColor,
        },
        swatch: {
            padding: '4px',
            background: mode('gray.100', 'gray.900')(props),
            border: '1px solid',
            borderColor: mode('gray.400', 'gray.400')(props),
            borderRadius: 'md',
            boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
            display: 'inline-block',
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
