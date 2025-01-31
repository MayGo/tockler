import { Box, Text } from '@chakra-ui/react';
import { isEndDate, isStartDate, useDay } from '@datepicker-react/hooks';
import { useDatepickerContext } from '../context/DatepickerContext';
import { DayWrapper } from './DayWrapper';

interface DayProps {
    day: string;
    date: Date;
    children: any;
    onDateClicked: any;
}

function getVariant({ isSelected, isWithinHoverRange, isFirst, isLast }) {
    if (!isSelected && !isWithinHoverRange) return 'normal';
    if (isSelected) return 'selected';
    if (isWithinHoverRange) return 'rangeHover';
    if (isFirst || isLast) return 'firstOrLast';
    if (isFirst) return 'first';
    if (isLast) return 'last';

    return 'normal';
}
export function DayBox({ day, date, onDateClicked, children }: DayProps) {
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

    const { onKeyDown, onMouseEnter, tabIndex, isSelected, isWithinHoverRange, disabledDate } = dayProps;

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
                <Text fontWeight="bold" fontSize="larger">
                    {day}
                </Text>
            </Box>
            {children}
        </DayWrapper>
    );
}
