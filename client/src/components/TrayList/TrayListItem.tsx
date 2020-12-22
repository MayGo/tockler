import { Box, Flex } from 'reflexbox';
import { Button, List } from 'antd';
import { ClockCircleOutlined, PauseOutlined, CaretRightOutlined } from '@ant-design/icons';

import moment from 'moment';
import React, { memo } from 'react';
import Moment from 'react-moment';
import TimeAgo from 'react-timeago';
import styled from 'styled-components';
import { convertDate } from '../../constants';

const CustomListItem = styled(List.Item)`
    padding-left: 5px;
    margin-top: 5px;
    &:last-child {
        margin-bottom: 5px;
    }
    background-color: ${({ theme: { variables } }) => variables['@component-background']};
    border-left: 5px solid ${props => props.color};
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
        <CustomListItem color={item.color} key={item.title}>
            <Flex alignItems="center" width={1} pl={10} pr={10}>
                <Box width={8 / 9} py={2}>
                    <Flex>
                        <CustomBox width={2 / 7} mr={2}>
                            {item.app}
                        </CustomBox>
                        <CustomBox width={5 / 7}>{item.title}</CustomBox>
                    </Flex>

                    <Flex>
                        <Box width={10 / 13}>
                            <Small>
                                <FormattedTime item={item} isRunning={isRunning} />
                                {'  '}
                                <ClockCircleOutlined />
                                {'  '}
                                <b>
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
                                </b>
                            </Small>
                        </Box>
                        <Flex width={3 / 11} justifyContent="flex-end">
                            <Small pr={2}>
                                {item.startDate && <TimeAgo date={item.startDate} />}
                            </Small>
                        </Flex>
                    </Flex>
                    <Flex>
                        {item.totalMs > 1 && (
                            <Box width={2 / 7}>
                                <Medium>
                                    Duration: <b>{moment.duration(item.totalMs).format()}</b>
                                </Medium>
                            </Box>
                        )}
                    </Flex>
                </Box>
                <ActionBtn width={1 / 9} justifyContent="flex-end">
                    {isRunning && (
                        <Button
                            type="primary"
                            shape="circle"
                            icon={<PauseOutlined />}
                            onClick={() => stopRunningLogItem()}
                        />
                    )}
                    {!isRunning && (
                        <Button
                            type="default"
                            shape="circle"
                            icon={<CaretRightOutlined />}
                            onClick={() => startNewLogItemFromOld(item)}
                        />
                    )}
                </ActionBtn>
            </Flex>
        </CustomListItem>
    );
}

TrayListItemPlain.whyDidYouRender = true;

export const TrayListItem = memo(TrayListItemPlain);
