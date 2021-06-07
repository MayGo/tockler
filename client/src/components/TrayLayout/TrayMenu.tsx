import React, { useState, useEffect, memo } from 'react';
import tocklerIcon from '../../assets/icons/tockler_icon.png';
import { EventEmitter } from '../../services/EventEmitter';
import { getOnlineStartTime } from '../../services/trackItem.api';
import moment from 'moment';
import Moment from 'react-moment';
import { Logger } from '../../logger';
import { useWindowFocused } from '../../hooks/windowFocusedHook';
import { Box, Center, Flex, Link } from '@chakra-ui/layout';
import { Link as RouterLink } from 'react-router-dom';
import { Image } from '@chakra-ui/image';
import { Brand } from '../MainLayout/HeaderMenu.styles';
import { AiOutlineArrowsAlt, AiOutlineClockCircle, AiOutlinePoweroff } from 'react-icons/ai';
import { Tooltip } from '@chakra-ui/tooltip';
import { IconButton } from '@chakra-ui/button';
import { useColorModeValue } from '@chakra-ui/color-mode';

const getNow = () => moment().subtract(1, 'seconds');

export const TrayMenuPlain = () => {
    const { windowIsActive } = useWindowFocused();
    const [onlineSince, setOnlineSince] = useState();
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
        <Flex
            bg={useColorModeValue('gray.100', 'gray.900')}
            w="100%"
            p={4}
            position="sticky"
            top={0}
            zIndex={100}
        >
            <Box pr={3}>
                <Link as={RouterLink} onClick={toggleMainWindow}>
                    <Flex>
                        <Center pr={3}>
                            <Image
                                boxSize="28px"
                                objectFit="cover"
                                src={tocklerIcon}
                                alt="Tockler"
                            />
                        </Center>
                        <Brand>Tockler</Brand>
                    </Flex>
                </Link>
            </Box>

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
            <Box pr={3}>
                <Tooltip placement="bottom" label="Open main window">
                    <IconButton
                        onClick={toggleMainWindow}
                        variant="outline"
                        colorScheme="blue"
                        aria-label="Open main window"
                        icon={<AiOutlineArrowsAlt />}
                    />
                </Tooltip>
            </Box>

            <Box>
                <Tooltip placement="bottom" label="Quit app">
                    <IconButton
                        onClick={exitApp}
                        variant="outline"
                        colorScheme="blue"
                        aria-label="Quit app"
                        icon={<AiOutlinePoweroff />}
                    />
                </Tooltip>
            </Box>
        </Flex>
    );
};

TrayMenuPlain.whyDidYouRender = true;

export const TrayMenu = memo(TrayMenuPlain);
