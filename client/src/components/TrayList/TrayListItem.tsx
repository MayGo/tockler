import { Box, Flex, Text } from '@chakra-ui/react';
import { memo } from 'react';
import { HStack, IconButton } from '@chakra-ui/react';
import { convertDate, DATE_TIME_FORMAT } from '../../constants';
import { FaPlay, FaStop } from 'react-icons/fa';
import { shortTime } from '../../time.util';
import { OverflowText } from '../TrackItemTable/OverflowText';
import { ShortTimeInterval } from './ShortTimeInterval';

const formatDate = (date) => convertDate(date).format(DATE_TIME_FORMAT);

const FormattedTime = ({ beginDate, endDate, isRunning }: any) => {
    const full = isRunning ? `${formatDate(beginDate)}` : `${formatDate(beginDate)} - ${formatDate(endDate)}`;

    return <span>{full}</span>;
};

export function TrayListItemPlain({ item, startNewLogItemFromOld, stopRunningLogItem }: any) {
    const { isRunning, totalMs, title, app, color } = item;
    return (
        <Box p={4}>
            <HStack alignItems="center" width="100%" pr={2}>
                <Box flex={1} minWidth="0">
                    <HStack alignItems="center" pb={2} minWidth="0">
                        <Box bg={color} w="8px" h="8px" minWidth="8px" borderRadius="full" />

                        <OverflowText fontWeight="bold" fontSize="md" minWidth="100px">
                            {app}
                        </OverflowText>

                        <OverflowText fontSize="md" minWidth="0">
                            {title}
                        </OverflowText>
                    </HStack>

                    <Flex alignItems="center" pl={4}>
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
                </Box>

                {isRunning && <IconButton aria-label="pause" icon={<FaStop />} onClick={() => stopRunningLogItem()} />}
                {!isRunning && (
                    <IconButton aria-label="start" icon={<FaPlay />} onClick={() => startNewLogItemFromOld(item)} />
                )}
            </HStack>
        </Box>
    );
}

export const TrayListItem = memo(TrayListItemPlain);
