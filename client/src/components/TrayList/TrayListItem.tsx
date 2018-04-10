import * as React from 'react';
// import { Layout } from 'antd';
import { Button, Row, Col } from 'antd';

import styled from 'styled-components';
import * as moment from 'moment';
import Moment from 'react-moment';
import TimeAgo from 'react-timeago';

const CustomListItem = styled.div`
    background-color: white;
    padding-left: 5px;
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
            <Row>
                <Col span={22}>
                    <Row>
                        <Col span={6}>{item.app}</Col>
                        <Col span={18}>{item.title}</Col>
                    </Row>
                    <Row>
                        <Col span={18}>
                            <small>
                                <FormattedTime item={item} isRunning={isRunning} />
                                <b>
                                    <Moment from={item.beginDate} ago={true}>
                                        {item.endDate}
                                    </Moment>
                                </b>
                            </small>
                        </Col>
                        <Col span={6}>
                            <small>
                                <TimeAgo date={item.beginDate} />
                            </small>
                        </Col>
                    </Row>
                </Col>
                <Col span={2}>
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
                </Col>
            </Row>
        </CustomListItem>
    );
}
