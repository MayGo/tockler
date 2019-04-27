import * as React from 'react';
import { Button, Icon } from 'antd';
import { Flex, Box } from 'grid-styled';
import styled from 'styled-components';
import moment from 'moment';
import Moment from 'react-moment';
import TimeAgo from 'react-timeago';
import { convertDate } from '../../constants';

const CustomListItem = styled.div`
    background-color: white;
    padding-left: 5px;
    margin-top: 5px;
    border-left: 5px solid ${(props: any) => props.color};
`;

const Small = styled(Box)`
    font-size: 10px;
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

export function TrayListItem({ item, startNewLogItemFromOld, stopRunningLogItem, isRunning }: any) {
    return (
        <CustomListItem color={item.color}>
            <Flex alignItems="center">
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
                        <Flex width={3 / 11} justifyContent="flex-end">
                            <Small pr={2}>
                                <TimeAgo date={item.beginDate} />
                            </Small>
                        </Flex>
                    </Flex>
                </Box>
                <ActionBtn width={1 / 9} justifyContent="flex-end">
                    {isRunning && (
                        <Button
                            type="primary"
                            shape="circle"
                            icon="pause"
                            onClick={() => stopRunningLogItem()}
                        />
                    )}
                    {!isRunning && (
                        <Button
                            type="default"
                            shape="circle"
                            icon="right"
                            onClick={() => startNewLogItemFromOld(item)}
                        />
                    )}
                </ActionBtn>
            </Flex>
        </CustomListItem>
    );
}
