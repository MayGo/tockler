import { Box, Link, Text, useColorModeValue } from '@chakra-ui/react';
import { isEndDate, isStartDate, useDay } from '@datepicker-react/hooks';
import React, { useMemo, useRef } from 'react';
import { OnDayRenderType, useDatepickerContext } from '../context/DatepickerContext';
import { useStyleProps } from '../context/StylesContext';
import { DayState, DayStyles } from '../types';
import { Link as RouterLink } from 'react-router-dom';

function getColor<T>(
    { isSelected, isWithinHoverRange, isFirst, isLast }: OnDayRenderType,
    { base, normal, rangeHover, selected, firstOrLast, first, last }: DayState<T>,
) {
    let style = base;
    if (!isSelected && !isWithinHoverRange) style = { ...style, ...normal };
    if (isSelected) style = { ...style, ...selected };
    if (isWithinHoverRange) style = { ...style, ...rangeHover };
    if (isFirst || isLast) style = { ...style, ...firstOrLast };
    if (isFirst) style = { ...style, ...first };
    if (isLast) style = { ...style, ...last };
    return style;
}

interface DayProps {
    day: string;
    date: Date;
    children: any;
    onDateClicked: any;
}

export function DayForCalendar({ day, date, onDateClicked, children }: DayProps) {
    const dayRef = useRef<any>(null);

    const {
        focusedDate,
        isDateFocused,
        isDateSelected,
        isDateHovered,
        isDateBlocked,
        isFirstOrLastSelectedDate,
        onDateSelect,
        onDateFocus,
        onDateHover,
        onDayRender,
        startDate,
        endDate,
    } = useDatepickerContext();

    const dayProps = useDay({
        date,
        focusedDate,
        isDateFocused,
        isDateSelected,
        isDateHovered,
        isDateBlocked,
        isFirstOrLastSelectedDate,
        onDateFocus,
        onDateSelect,
        onDateHover,
        dayRef,
    });

    const {
        onClick,
        onKeyDown,
        onMouseEnter,
        tabIndex,
        isSelectedStartOrEnd,
        isSelected,
        isWithinHoverRange,
        disabledDate,
    } = dayProps;

    const styleProps = useStyleProps<DayStyles>({
        day: {
            base: {
                height: '156px',
                width: '100%',
                minWidth: 'unset',
                fontWeight: 'medium',
                fontSize: ['sm', 'md'],
                border: '2px solid',
                textColor: useColorModeValue('gray.900', 'white'),

                borderColor: 'transparent',
                background: useColorModeValue('white', 'gray.700'),

                overflow: 'hidden',
                _hover: {
                    borderColor: 'transparent',
                    background: 'transparent',
                },
            },
            normal: {
                _hover: {
                    borderColor: useColorModeValue('black', 'white'),
                },
            },
            rangeHover: {
                _hover: {
                    borderColor: useColorModeValue('black', 'white'),
                },
            },
            selected: {
                _hover: {
                    borderColor: useColorModeValue('black', 'white'),
                },
            },
            firstOrLast: {
                textColor: useColorModeValue('white', 'black'),
                background: useColorModeValue('black', 'white'),
                _hover: {
                    textColor: useColorModeValue('white', 'black'),
                    background: useColorModeValue('black', 'white'),
                },
            },
            first: {},
            last: {},
        },
        dayContainer: {
            base: {
                height: '148px',
                width: ['32px', '48px'],
                _hover: {
                    borderRightRadius: '100%',
                },
            },
            normal: {},
            rangeHover: {
                background: useColorModeValue('gray.100', 'gray.500'),
                _hover: {
                    borderRightRadius: '100%',
                },
            },
            selected: {
                background: useColorModeValue('gray.100', 'gray.500'),
                _hover: {
                    borderRightRadius: '0%',
                },
            },
            firstOrLast: {
                background: useColorModeValue('gray.100', 'gray.500'),
            },
            first: {
                borderLeftRadius: '100%',
            },
            last: {
                borderRightRadius: '100%',
                _hover: {
                    borderRightRadius: '100%',
                },
            },
        },
    });

    const isFirst = isStartDate(date, startDate);
    const isLast = isEndDate(date, endDate);

    const buttonStyle = useMemo(
        () =>
            getColor(
                {
                    isFirst,
                    isLast,
                    isSelected,
                    isWithinHoverRange,
                    isSelectedStartOrEnd,
                    disabledDate,
                },
                {
                    base: styleProps.day.base,
                    normal: styleProps.day.normal,
                    rangeHover: styleProps.day.rangeHover,
                    selected: styleProps.day.selected,
                    first: styleProps.day.first,
                    last: styleProps.day.last,
                    firstOrLast: styleProps.day.firstOrLast,
                },
            ),
        [
            isFirst,
            isLast,
            isSelected,
            isWithinHoverRange,
            isSelectedStartOrEnd,
            disabledDate,
            styleProps,
        ],
    );

    return (
        <Link
            as={RouterLink}
            {...buttonStyle}
            variant="unstyled"
            onClick={() => onDateClicked(date)}
            onKeyDown={onKeyDown}
            onMouseEnter={onMouseEnter}
            tabIndex={tabIndex}
            ref={dayRef}
            disabled={disabledDate}
            data-testid="Day"
            aria-label={`Day-${date.toDateString()}`}
            type="button"
        >
            <Box w="100%" height="100%">
                <Box textAlign="left" p={3} pb={0}>
                    {typeof onDayRender === 'function' ? (
                        onDayRender(date, {
                            isFirst,
                            isLast,
                            isSelected,
                            isWithinHoverRange,
                            isSelectedStartOrEnd,
                            disabledDate,
                        })
                    ) : (
                        <Text bold fontSize="larger">
                            {day}
                        </Text>
                    )}
                </Box>
                {children}
            </Box>
        </Link>
    );
}
