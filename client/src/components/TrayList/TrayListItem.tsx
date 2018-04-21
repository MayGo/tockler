import * as React from 'react';
// import { Layout } from 'antd';
import { Button } from 'antd';

import { Flex, Box } from 'grid-styled';

import styled from 'styled-components';
import * as moment from 'moment';
import Moment from 'react-moment';
import TimeAgo from 'react-timeago';

const CustomListItem = styled.div`
    background-color: white;
    padding-left: 5px;
    margin-top: 5px;
    border-left: 5px solid ${(props: any) => props.color};
`;

const formatDate = date => moment(date).format('YYYY-MM-DD HH:mm:ss');

const FormattedTime = ({ item, isRunning }: any) => {
    const full = isRunning
        ? `${formatDate(item.beginDate)}`
        : `${formatDate(item.beginDate)} - ${formatDate(item.endDate)}`;

    return <span>{full}</span>;
};

export function TrayListItem({ item, startNewLogItemFromOld, stopRunningLogItem, isRunning }: any) {
    return (
        <CustomListItem color={item.color}>
            <Flex alignItems="center">
                <Box width={8 / 9}>
                    <Flex>
                        <Box width={1 / 4}>{item.app}</Box>
                        <Box width={3 / 4}>{item.title}</Box>
                    </Flex>
                    <Flex>
                        <Box width={8 / 10}>
                            <small>
                                <FormattedTime item={item} isRunning={isRunning} />
                                {'  '}
                                <b>
                                    {!isRunning && (
                                        <Moment from={item.beginDate} ago={true}>
                                            {item.endDate}
                                        </Moment>
                                    )}
                                    {isRunning && (
                                        <Moment fromNow={true} ago={true}>
                                            {item.beginDate}
                                        </Moment>
                                    )}
                                </b>
                            </small>
                        </Box>
                        <Flex width={3 / 10} justifyContent="flex-end">
                            <small>
                                <TimeAgo date={item.beginDate} />
                            </small>
                        </Flex>
                    </Flex>
                </Box>
                <Flex width={1 / 9} justifyContent="flex-end" p={2}>
                    {isRunning && (
                        <Button
                            type="primary"
                            shape="circle"
                            icon="pause-circle"
                            onClick={() => stopRunningLogItem()}
                        />
                    )}
                    {!isRunning && (
                        <Button
                            type="primary"
                            shape="circle"
                            icon="play-circle-o"
                            onClick={() => startNewLogItemFromOld(item)}
                        />
                    )}
                </Flex>
            </Flex>
        </CustomListItem>
    );
}
