import { Box } from '@chakra-ui/react';
import React, { useEffect, useRef } from 'react';

interface IndeterminateCheckboxProps {
    indeterminate?: boolean;
    checked?: boolean;
    disabled?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const IndeterminateCheckbox: React.FC<IndeterminateCheckboxProps> = ({
    indeterminate = false,
    checked = false,
    disabled = false,
    onChange,
    ...rest
}) => {
    const ref = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (ref.current) {
            ref.current.indeterminate = !!indeterminate;
        }
    }, [indeterminate]);

    return (
        <Box display="inline-flex" alignItems="center" justifyContent="center">
            <input
                type="checkbox"
                ref={ref}
                checked={checked}
                disabled={disabled}
                onChange={onChange}
                style={{
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    width: '18px',
                    height: '18px',
                }}
                {...rest}
            />
        </Box>
    );
};
