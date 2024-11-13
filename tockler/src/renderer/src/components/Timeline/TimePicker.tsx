import { Input } from '@chakra-ui/react';
import { Box } from '@chakra-ui/react';
import React, { useState } from 'react';
import TimeKeeper from 'react-timekeeper';

export function TimePicker({ time, onChange, readOnly }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <Input
                value={time}
                onFocus={() => !readOnly && setIsOpen(true)}
                onBlur={() => !readOnly && setIsOpen(false)}
                readOnly={readOnly}
            />
            {isOpen && (
                <Box position="absolute" zIndex={1000}>
                    <TimeKeeper
                        time={time}
                        onChange={onChange}
                        hour24Mode
                        switchToMinuteOnHourSelect
                        closeOnMinuteSelect
                        onDoneClick={() => setIsOpen(false)}
                    />
                </Box>
            )}
        </>
    );
}
