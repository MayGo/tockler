import { Box, Flex, Text } from '@chakra-ui/layout';
import React, { memo, useState } from 'react';
import { HStack, IconButton, useInterval, VStack } from '@chakra-ui/react';
import { convertDate, DATE_TIME_FORMAT } from '../../constants';
import { FaPlay, FaStop } from 'react-icons/fa';
import { shortTime } from '../../time.util';

const formatDate = date => convertDate(date).format(DATE_TIME_FORMAT);

const FormattedTime = ({ beginDate, endDate, isRunning }: any) => {
    const full = isRunning
        ? `${formatDate(beginDate)}`
        : `${formatDate(beginDate)} - ${formatDate(endDate)}`;

    return <span>{full}</span>;
};

const ShortTimeInterval = ({ totalMs }) => {
    const [time, setTime] = useState(totalMs);
    useInterval(() => {
        setTime(oldTime => oldTime + 1000);
    }, 1000);

    return shortTime(time);
};

export function TrayListItemPlain({ item, startNewLogItemFromOld, stopRunningLogItem }: any) {
    const { isRunning, totalMs, title, app, color } = item;
    return (
        <Box p={4}>
            <Flex alignItems="center" width="100%" pl={1} pr={2}>
                <VStack width={'100%'} alignItems="flex-start">
                    <HStack alignItems="center">
                        <Box bg={color} w="8px" h="8px" borderRadius="full" />
                        <Text fontWeight="bold" fontSize="md">
                            {app}
                        </Text>
                        <Text fontSize="md">{title}</Text>
                    </HStack>

                    <Flex alignItems="center">
                        <Text fontSize="xs">
                            <FormattedTime {...item} />
                        </Text>

                        <Text fontSize="xs" fontWeight="bold" pl={3}>
                            {totalMs > 1 && (
                                <>
                                    {!isRunning && shortTime(totalMs)}
                                    {isRunning && <ShortTimeInterval totalMs={totalMs} />}
                                </>
                            )}
                        </Text>
                    </Flex>
                </VStack>

                {isRunning && (
                    <IconButton
                        aria-label="pause"
                        icon={<FaStop />}
                        onClick={() => stopRunningLogItem()}
                    />
                )}
                {!isRunning && (
                    <IconButton
                        aria-label="start"
                        icon={<FaPlay />}
                        onClick={() => startNewLogItemFromOld(item)}
                    />
                )}
            </Flex>
        </Box>
    );
}

TrayListItemPlain.whyDidYouRender = true;

export const TrayListItem = memo(TrayListItemPlain);
