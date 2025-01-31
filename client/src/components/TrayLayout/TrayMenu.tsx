import { memo } from 'react';
import { EventEmitter } from '../../services/EventEmitter';
import { Box } from '@chakra-ui/react';
import { AiOutlineArrowsAlt, AiOutlinePoweroff } from 'react-icons/ai';
import { Tooltip } from '@chakra-ui/react';
import { IconButton } from '@chakra-ui/react';
import { HStack } from '@chakra-ui/react';
import { Header } from '../Header/Header';

export const TrayMenuPlain = () => {
    const exitApp = () => {
        EventEmitter.send('close-app');
    };

    const toggleMainWindow = () => {
        EventEmitter.send('toggle-main-window');
    };

    return (
        <Header brandLinkProps={{ onClick: toggleMainWindow }}>
            <Box flex="1"></Box>

            <HStack spacing={3} pr={1}>
                <Tooltip placement="bottom" label="Open main window">
                    <IconButton
                        onClick={toggleMainWindow}
                        variant="ghost"
                        colorScheme="gray"
                        aria-label="Open main window"
                        icon={<AiOutlineArrowsAlt />}
                    />
                </Tooltip>

                <Tooltip placement="bottom" label="Quit app">
                    <IconButton
                        onClick={exitApp}
                        variant="ghost"
                        colorScheme="gray"
                        aria-label="Quit app"
                        icon={<AiOutlinePoweroff />}
                    />
                </Tooltip>
            </HStack>
        </Header>
    );
};

export const TrayMenu = memo(TrayMenuPlain);
