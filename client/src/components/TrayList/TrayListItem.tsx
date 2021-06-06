import { Box, Flex, Text } from '@chakra-ui/layout';
import moment from 'moment';
import React, { memo } from 'react';
import Moment from 'react-moment';
import TimeAgo from 'react-timeago';
import styled from 'styled-components';
import { IconButton } from '@chakra-ui/react';
import { convertDate } from '../../constants';
import { AiOutlineCaretRight, AiOutlineClockCircle, AiOutlinePause } from 'react-icons/ai';

const CustomListItem = styled(Box)`
    padding-left: 5px;
    margin-top: 5px;
    &:last-child {
        margin-bottom: 5px;
    }
    background-color: ${({ theme: { variables } }) => variables['@component-background']};
    border-left: 5px solid ${props => props.leftColor};
`;

const Small = styled(Box)`
    font-size: 10px;
`;

const Medium = styled(Box)`
    font-size: 12px;
`;

const ActionBtn = styled(Flex)`
    margin: 2px 0;
`;

const CustomBox = styled(Box)`
    overflow: hidden;
`;

const formatDate = date => convertDate(date).format('YYYY-MM-DD HH:mm:ss');

const FormattedTime = ({ item, isRunning }: any) => {
    const full = isRunning
        ? `${formatDate(item.beginDate)}`
        : `${formatDate(item.beginDate)} - ${formatDate(item.endDate)}`;

    return <span>{full}</span>;
};

export function TrayListItemPlain({
    item,
    startNewLogItemFromOld,
    stopRunningLogItem,
    isRunning,
}: any) {
    return (
        <CustomListItem leftColor={item.color} key={item.title}>
            <Flex alignItems="center" width="100%" pl={1} pr={2}>
                <Box width="80%" py={2} flex={1}>
                    <Flex>
                        <Box overflow="hidden" width="30%" mr={2}>
                            {item.app}
                        </Box>
                        <Box overflow="hidden">{item.title}</Box>
                    </Flex>

                    <Flex alignItems="center">
                        <Text fontSize="xm">
                            <FormattedTime item={item} isRunning={isRunning} />
                        </Text>
                        <Box px={1}>
                            <AiOutlineClockCircle />
                        </Box>
                        <b>
                            <Text fontSize="xm">
                                {!isRunning && (
                                    <Moment from={item.beginDate} ago>
                                        {item.endDate}
                                    </Moment>
                                )}
                                {isRunning && (
                                    <Moment fromNow ago>
                                        {item.beginDate}
                                    </Moment>
                                )}
                            </Text>
                        </b>
                    </Flex>
                    {item.startDate && (
                        <Box pr={2}>
                            <Text fontSize="xm">
                                <TimeAgo date={item.startDate} />
                            </Text>
                        </Box>
                    )}
                    {item.totalMs > 1 && (
                        <Box>
                            <Text fontSize="sm">
                                Duration: <b>{moment.duration(item.totalMs).format()}</b>
                            </Text>
                        </Box>
                    )}
                </Box>

                {isRunning && (
                    <IconButton
                        aria-label="pause"
                        icon={<AiOutlinePause />}
                        onClick={() => stopRunningLogItem()}
                    />
                )}
                {!isRunning && (
                    <IconButton
                        aria-label="start"
                        icon={<AiOutlineCaretRight />}
                        onClick={() => startNewLogItemFromOld(item)}
                    />
                )}
            </Flex>
        </CustomListItem>
    );
}

TrayListItemPlain.whyDidYouRender = true;

export const TrayListItem = memo(TrayListItemPlain);
