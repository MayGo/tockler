import React from 'react';
import { Box, Text, useStyleConfig } from '@chakra-ui/react';
import { isEndDate, isStartDate, useDay } from '@datepicker-react/hooks';
import { useDatepickerContext } from '../context/DatepickerContext';
import { Link as RouterLink } from 'react-router-dom';

interface DayProps {
    day: string;
    date: Date;
    children: any;
    onDateClicked: any;
}

const DayWrapper = ({ variant, ...rest }) => {
    const styles = useStyleConfig('CalendarDay', { variant });
    return <Box as={RouterLink} __css={styles} data-testid="Day" {...rest} />;
};

function getVariant({ isSelected, isWithinHoverRange, isFirst, isLast }) {
    if (!isSelected && !isWithinHoverRange) return 'normal';
    if (isSelected) return 'selected';
    if (isWithinHoverRange) return 'rangeHover';
    if (isFirst || isLast) return 'firstOrLast';
    if (isFirst) return 'first';
    if (isLast) return 'last';

    return 'normal';
}
export function CalendarDay({ day, date, onDateClicked, children }: DayProps) {
    const {
        focusedDate,
        isDateFocused,
        isDateHovered,
        isDateBlocked,
        isFirstOrLastSelectedDate,
        onDateSelect,
        onDateFocus,
        onDateHover,
        startDate,
        endDate,
    } = useDatepickerContext();

    const dayProps = useDay({
        date,
        focusedDate,
        isDateFocused,
        isDateSelected: isDateFocused,
        isDateHovered,
        isDateBlocked,
        isFirstOrLastSelectedDate,
        onDateFocus,
        onDateSelect,
        onDateHover,
    });

    const {
        onKeyDown,
        onMouseEnter,
        tabIndex,
        isSelected,
        isWithinHoverRange,
        disabledDate,
    } = dayProps;

    const isFirst = isStartDate(date, startDate);
    const isLast = isEndDate(date, endDate);

    const variant = getVariant({
        isSelected,
        isWithinHoverRange,
        isFirst,
        isLast,
    });

    return (
        <DayWrapper
            variant={variant}
            onClick={() => onDateClicked(date)}
            onKeyDown={onKeyDown}
            onMouseEnter={onMouseEnter}
            tabIndex={tabIndex}
            disabled={disabledDate}
            aria-label={`Day-${date.toDateString()}`}
        >
            <Box textAlign="left" p={3} pb={0}>
                <Text bold fontSize="larger">
                    {day}
                </Text>
            </Box>
            {children}
        </DayWrapper>
    );
}
