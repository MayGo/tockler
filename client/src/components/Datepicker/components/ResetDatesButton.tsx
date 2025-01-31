import { RepeatIcon } from '@chakra-ui/icons';
import { Button } from '@chakra-ui/react';

import { useDatepickerContext } from '../context/DatepickerContext';
import { useStyleProps } from '../context/StylesContext';
import { ResetDatesButtonStyles } from '../types';

interface ResetDatesProps {
    onResetDates(): void;
    text: string;
}

export function ResetDatesButton({ onResetDates, text }: ResetDatesProps) {
    const { phrases } = useDatepickerContext();

    const styleProps = useStyleProps<ResetDatesButtonStyles>({
        resetDatesButton: {},
    });

    return (
        <Button
            icon={<RepeatIcon />}
            tabIndex={-1}
            aria-label={phrases.resetDates}
            {...styleProps.resetDatesButton}
            onClick={onResetDates}
            onMouseUp={(e) => {
                e.currentTarget.blur();
            }}
        >
            {text}
        </Button>
    );
}
