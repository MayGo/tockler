import { mode } from '@chakra-ui/theme-tools';

export const TableStyle = {
    baseStyle: props => ({
        table: {
            tableLayout: 'fixed',
        },
        thead: {
            bg: mode(`gray.500`, `gray.500`)(props),
        },
    }),
    variants: {
        simple: props => ({
            td: {
                borderColor: mode(`gray.500`, `gray.500`)(props),
            },
        }),
    },
};
