import { mode } from '@chakra-ui/theme-tools';
import { ComponentStyleConfig } from '@chakra-ui/react';

const dayStyle = {
    height: '156px',
    width: '100%',
    minWidth: 'unset',
    border: '2px solid',
    borderColor: 'transparent',
};

export const CalendarStyle = {
    parts: ['calendar', 'weekdayLabel', 'grid'],
    baseStyle: props => ({
        calendar: {
            w: '100%',
        },
        separator: {
            bg: 'gray.500',
            h: '1px',
        },
        weekdayLabel: {
            bg: 'gray.500',
            p: 3,
            pl: 4,
            fontWeight: 'bold',
            fontSize: 'md',
        },

        grid: {
            bg: 'gray.500',
        },
        day: {
            bg: mode('white', 'gray.700')(props),
            ...dayStyle,
        },
        emptyDay: {
            bg: mode('white', 'gray.800')(props),
            ...dayStyle,
        },
    }),

    defaultProps: {
        size: 'md',
    },
};

export const CalendarDayStyle: ComponentStyleConfig = {
    baseStyle: props => ({
        height: '156px',
        width: '100%',
        minWidth: 'unset',
        fontWeight: 'medium',
        fontSize: 'md',
        border: '2px solid',
        textColor: mode('gray.900', 'white')(props),
        borderColor: 'transparent',
        background: mode('white', 'gray.700')(props),
        overflow: 'hidden',

        _hover: {
            borderColor: 'transparent',
            background: 'transparent',
            cursor: 'pointer',
        },
    }),
    variants: {
        normal: props => ({
            _hover: {
                borderColor: mode('black', 'white')(props),
            },
        }),
        rangeHover: props => ({
            _hover: {
                borderColor: mode('black', 'white')(props),
            },
        }),
        selected: props => ({
            borderColor: mode('black', 'brand.mainColor')(props),

            _hover: {
                borderColor: mode('black', 'white')(props),
            },
        }),
        firstOrLast: props => ({
            textColor: mode('white', 'black')(props),
            background: mode('black', 'white')(props),
            _hover: {
                textColor: mode('white', 'black')(props),
                background: mode('black', 'white')(props),
            },
        }),
    },
    defaultProps: {
        variant: 'normal',
    },
};
