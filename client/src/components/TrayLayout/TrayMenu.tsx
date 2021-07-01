import React, { useState, useEffect, memo } from 'react';
import { EventEmitter } from '../../services/EventEmitter';
import { getOnlineStartTime } from '../../services/trackItem.api';
import moment from 'moment';
import Moment from 'react-moment';
import { Logger } from '../../logger';
import { useWindowFocused } from '../../hooks/windowFocusedHook';
import { Box, Center } from '@chakra-ui/layout';
import { AiOutlineArrowsAlt, AiOutlineClockCircle, AiOutlinePoweroff } from 'react-icons/ai';
import { Tooltip } from '@chakra-ui/tooltip';
import { IconButton } from '@chakra-ui/button';
import { HStack } from '@chakra-ui/react';
import { Header } from '../Header/Header';

const getNow = () => moment().subtract(1, 'seconds');

export const TrayMenuPlain = () => {
    const { windowIsActive } = useWindowFocused();
    const [onlineSince, setOnlineSince] = useState<any>();
    const exitApp = () => {
        EventEmitter.send('close-app');
    };
    const toggleMainWindow = () => {
        EventEmitter.send('toggle-main-window');
    };

    useEffect(() => {
        const systemIsOnline = () => {
            Logger.debug('system-is-online');
            setOnlineSince(getNow());
        };
        const systemIsNotOnline = () => {
            Logger.debug('system-is-not-online');
            setOnlineSince(null);
        };

        EventEmitter.on('system-is-online', systemIsOnline);
        EventEmitter.on('system-is-not-online', systemIsNotOnline);

        return () => {
            EventEmitter.off('system-is-online', systemIsOnline);
            EventEmitter.off('system-is-not-online', systemIsNotOnline);
        };
    }, []);

    useEffect(() => {
        if (windowIsActive) {
            const loadOnlineStartTime = async () => {
                const onlineStartTime = await getOnlineStartTime();

                setOnlineSince(onlineStartTime ? moment(onlineStartTime) : getNow());
            };

            loadOnlineStartTime();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [windowIsActive]);

    return (
        <Header brandLinkProps={{ onClick: toggleMainWindow }}>
            <Box p={3}>
                {onlineSince && (
                    <Tooltip placement="bottom" label="Time without a break">
                        <Center>
                            <Box pr={1}>
                                <AiOutlineClockCircle />
                            </Box>
                            <b>
                                <Moment date={onlineSince} durationFromNow interval={60} />
                            </b>
                        </Center>
                    </Tooltip>
                )}
            </Box>

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

TrayMenuPlain.whyDidYouRender = true;

export const TrayMenu = memo(TrayMenuPlain);
