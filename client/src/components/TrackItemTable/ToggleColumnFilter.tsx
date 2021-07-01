import React, { useRef } from 'react';
import {
    Popover,
    PopoverTrigger,
    useDisclosure,
    IconButton,
    PopoverContent,
    PopoverArrow,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';

export function ToggleColumnFilter({ children }) {
    const { onOpen, onClose, isOpen } = useDisclosure();
    const firstFieldRef = useRef(null);
    const form = React.cloneElement(children, { ref: firstFieldRef, onCancel: onClose });

    return (
        <Popover
            isOpen={isOpen}
            initialFocusRef={firstFieldRef}
            onOpen={onOpen}
            onClose={onClose}
            placement="right"
            closeOnBlur={true}
        >
            <PopoverTrigger>
                <IconButton
                    variant="ghost"
                    aria-label="open search"
                    size="sm"
                    icon={<SearchIcon />}
                />
            </PopoverTrigger>
            <PopoverContent>
                <PopoverArrow />

                {form}
            </PopoverContent>
        </Popover>
    );
}
