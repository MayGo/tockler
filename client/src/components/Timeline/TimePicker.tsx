import { Input } from '@chakra-ui/input';
import { Box } from '@chakra-ui/layout';
import React, { useState } from 'react';
import TimeKeeper from 'react-timekeeper';

export function TimePicker({ time, onChange }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <Input
                value={time}
                onFocus={() => setIsOpen(true)}
                onBlur={() => setIsOpen(false)}
                readOnly
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
