import * as React from 'react';
import { Button, Icon } from 'antd';
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

const Small = Box.extend`
    font-size: 10px;
`;
const ActionBtn = Flex.extend`
    border-left: 1px solid #f0f2f5;
    margin: 2px 0;
`;

const CustomBox = Box.extend`
    overflow: hidden;
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
                        <CustomBox width={2 / 7} mr={2}>
                            {item.app}
                        </CustomBox>
                        <CustomBox width={5 / 7}>{item.title}</CustomBox>
                    </Flex>
                    <Flex>
                        <Box width={8 / 10}>
                            <Small>
                                <FormattedTime item={item} isRunning={isRunning} />
                                {'  '}
                                <Icon type="clock-circle-o" />
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
                            </Small>
                        </Box>
                        <Flex width={3 / 10} justifyContent="flex-end">
                            <Small pr={2}>
                                <TimeAgo date={item.beginDate} />
                            </Small>
                        </Flex>
                    </Flex>
                </Box>
                <ActionBtn width={1 / 9} justifyContent="flex-end" p={2}>
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
                </ActionBtn>
            </Flex>
        </CustomListItem>
    );
}
