import { RepeatIcon } from '@chakra-ui/icons';
import { Button } from '@chakra-ui/react';

import { useDatepickerContext } from '../context/DatepickerContext';
import { useStyleProps } from '../context/StylesContext';
import { ResetDatesButtonStyles } from '../types';
import { MouseEvent } from 'react';

interface ResetDatesProps {
    onResetDates(): void;
    text: string;
}

export function ResetDatesButton({ onResetDates, text }: ResetDatesProps) {
    const { phrases } = useDatepickerContext();

    const styleProps = useStyleProps<ResetDatesButtonStyles>({
        resetDatesButton: {},
    });

    function handleMouseUp(e: MouseEvent<HTMLButtonElement, MouseEvent>) {
        e.currentTarget.blur();
    }

    return (
        <Button
            icon={<RepeatIcon />}
            tabIndex={-1}
            aria-label={phrases.resetDates}
            {...styleProps.resetDatesButton}
            onClick={onResetDates}
            onMouseUp={handleMouseUp}
        >
            {text}
        </Button>
    );
}
