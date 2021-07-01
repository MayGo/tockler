import { mode } from '@chakra-ui/theme-tools';

export const TableStyle = {
    baseStyle: props => ({
        table: {
            tableLayout: 'fixed',
        },
        thead: {
            bg: mode(`gray.300`, `gray.500`)(props),
        },
        th: {},
    }),
    variants: {
        simple: props => ({
            td: {
                borderColor: mode(`gray.300`, `gray.500`)(props),
            },
            th: {
                _notFirst: {
                    paddingInlineStart: 'var(--chakra-space-2)',
                },
            },
        }),
    },
};
