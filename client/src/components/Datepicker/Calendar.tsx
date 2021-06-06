import { Box, Flex, HStack, Stack, useBreakpointValue, useColorModeValue } from '@chakra-ui/react';
import { MonthType, useDatepicker } from '@datepicker-react/hooks';
import React, { useRef } from 'react';
import { ActionButton, Month, ResetDatesButton } from './components';
import { useStyleProps } from './context/StylesContext';
import { DatepickerComponentStyles } from './types';
import { CalendarMonth } from './CalendarMonth';
import moment from 'moment';

export interface MonthProps {
    dateCellRender: any;
    onDateClicked: any;
}

export const Calendar = ({ dateCellRender, onDateClicked }: MonthProps) => {
    const onDatesChange = () => {};
    const date = new Date();
    const dp = useDatepicker({
        onDatesChange,
        startDate: date,
        endDate: date,
        focusedInput: null,
        onDateSelect: onDateClicked,
    });

    /* useImperativeHandle(ref, () => ({
        onDateSelect: (date: Date) => {
            dp.onDateSelect(date);
        },
    }));*/

    function _goToNextMonths() {
        dp.goToNextMonths();
    }

    function _goToPreviousMonths() {
        dp.goToPreviousMonths();
    }

    const styleProps = useStyleProps<DatepickerComponentStyles>({
        datepickerContainer: {
            background: useColorModeValue('white', 'gray.700'),
            borderRadius: 'md',
            position: 'relative',
            width: 'fit-content',
            shadow: 'md',
            px: [3, 5],
            py: [5, 7],
            zIndex: 1,
        },
        monthsWrapper: {
            spacing: [0, 8],
        },
        buttonsWrapper: {
            spacing: [1, 3],
        },
        arrowIcon: {
            my: [5, 15],
            color: 'gray.500',
        },
        datepickerFooter: {
            justifyContent: 'space-between',
            pt: [1, 3],
        },
    });
    const activeMonth = dp.activeMonths[0];
    const year = activeMonth.year;
    const month = activeMonth.month;

    return (
        <Box {...styleProps.monthContainer} w="100%">
            <Box position="relative">
                <Flex {...styleProps.datepickerFooter}>
                    <HStack {...styleProps.buttonsWrapper}>
                        <ActionButton
                            direction={'left'}
                            onClick={_goToPreviousMonths}
                            aria-label="Previous month"
                        />
                        <ActionButton
                            direction={'right'}
                            onClick={_goToNextMonths}
                            aria-label="Next month"
                        />
                    </HStack>
                </Flex>
            </Box>
            <CalendarMonth
                year={year}
                month={month}
                dateCellRender={dateCellRender}
                onDateClicked={onDateClicked}
            />
        </Box>
    );
};
