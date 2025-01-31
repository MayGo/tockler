import { Stack, Text } from '@chakra-ui/react';
import { getInputValue } from '@datepicker-react/hooks';
import { useDatepickerContext } from '../context/DatepickerContext';
import { useStyleProps } from '../context/StylesContext';
import { InputDate, SelectDateStyles } from '../types';
import { getStateStyle } from '../utils/getStateStyle';

export interface SelectedDateProps {
    isFocused: boolean;
    date: InputDate;
}

export const SelectedDate = ({ isFocused, date }: SelectedDateProps) => {
    const { phrases, displayFormat } = useDatepickerContext();

    const styleProps = useStyleProps<SelectDateStyles>({
        selectDateContainer: {
            base: {
                width: '100%',
                borderBottom: '2px solid',
                borderColor: 'gray.300',
                paddingBottom: [1, 3],
            },
            active: {
                borderColor: 'blue.400',
            },
        },
        selectDateText: {
            base: {
                fontSize: 'xs',
                color: 'gray.500',
            },
            active: {},
        },
        selectDateDateText: {
            base: {
                fontWeight: 'bold',
                fontSize: ['sm', 'md', 'lg'],
            },
            active: {},
        },
    });

    return (
        <Stack {...getStateStyle(styleProps.selectDateContainer, isFocused)}>
            <Text {...getStateStyle(styleProps.selectDateText, isFocused)}>{phrases.datepickerStartDateLabel}</Text>
            <Text {...getStateStyle(styleProps.selectDateDateText, isFocused)}>
                {getInputValue(date, displayFormat, phrases.datepickerStartDatePlaceholder)}
            </Text>
        </Stack>
    );
};
