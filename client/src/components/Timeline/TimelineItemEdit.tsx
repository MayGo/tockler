import { Box, Flex } from 'reflexbox';
import { Typography, Button, Divider, Input, Modal, Select, TimePicker, Tooltip } from 'antd';
import {
    PlayCircleOutlined,
    SaveOutlined,
    DeleteOutlined,
    CloseOutlined,
    ExclamationCircleOutlined,
} from '@ant-design/icons';
import React, { useState, useEffect, memo } from 'react';
import { ColorPicker } from './ColorPicker';
import { Logger } from '../../logger';
import moment from 'moment';
import { TrackItemType } from '../../enum/TrackItemType';

const { Title } = Typography;

interface IProps {
    selectedTimelineItem: any;
    saveTimelineItem: any;
    changeColorForApp?: any;
    trayEdit?: boolean;
    clearTimelineItem?: any;
    deleteTimelineItem?: any;
}

const COLOR_SCOPE_ONLY_THIS = 'ONLY_THIS';
/*
function propsAreEqual(prev, next) {
    if (prev.selectedTimelineItem && next.selectedTimelineItem) {
        const equalById = prev.selectedTimelineItem.id === next.selectedTimelineItem.id;
        if (!next.selectedTimelineItem.id) {
            return prev.selectedTimelineItem === next.selectedTimelineItem;
        }

        return equalById;
    }

    return false;
}*/

const statusName = {
    [TrackItemType.AppTrackItem]: 'App',
    [TrackItemType.StatusTrackItem]: 'Status',
    [TrackItemType.LogTrackItem]: 'Log',
};

export const TimelineItemEdit = memo<IProps>(
    ({
        selectedTimelineItem,
        trayEdit,
        clearTimelineItem,
        saveTimelineItem,
        deleteTimelineItem,
    }) => {
        const [state, setState] = useState({
            trackItem: selectedTimelineItem,
            colorScope: COLOR_SCOPE_ONLY_THIS,
        });

        const { trackItem, colorScope } = state;

        useEffect(() => {
            Logger.debug('Selected timelineitem changed:', selectedTimelineItem);
            if (selectedTimelineItem) {
                setState({
                    trackItem: selectedTimelineItem,
                    colorScope: COLOR_SCOPE_ONLY_THIS,
                });
            }
        }, [selectedTimelineItem]);

        const changeColorHandler = color => {
            Logger.debug('Changed color:', color);

            setState({
                ...state,
                trackItem: {
                    ...state.trackItem,
                    color,
                },
            });
        };

        const changeAppName = e => {
            const { value } = e.target;
            Logger.debug('Changed app name:', value);

            setState({
                ...state,
                trackItem: {
                    ...state.trackItem,
                    app: value,
                },
            });
        };
        const changeTime = attr => value => {
            Logger.debug('Changed app time:', value);
            const oldDate = moment(state.trackItem[attr]);
            const newDate = moment(
                value
                    .toArray()
                    .slice(0, 4)
                    .concat(oldDate.toArray().slice(4)),
            );
            setState({
                ...state,
                trackItem: {
                    ...state.trackItem,
                    [attr]: newDate.valueOf(),
                },
            });
        };

        const changeAppTitle = e => {
            const { value } = e.target;
            Logger.debug('Changed app title:', value);

            setState({
                ...state,
                trackItem: {
                    ...state.trackItem,
                    title: value,
                },
            });
        };

        const closeEdit = () => {
            Logger.debug('Close TimelineItem');
            clearTimelineItem();
        };

        const changeColorScopeHandler = colorScope => {
            Logger.debug('Changed color scope:', colorScope);

            setState({
                ...state,
                colorScope,
            });
        };

        const saveBasedOnColorOptionHandler = () => {
            const { trackItem, colorScope } = state;

            saveTimelineItem(trackItem, colorScope);
        };
        const deleteItem = () => {
            const { trackItem } = state;

            deleteTimelineItem(trackItem);
        };

        const showDeleteConfirm = () => {
            Modal.confirm({
                title: 'Delete',
                icon: <ExclamationCircleOutlined />,
                content: 'Sure you want to delete?',
                okText: 'Delete',
                cancelText: 'Cancel',
                onOk: deleteItem,
                zIndex: 10000,
            });
        };

        if (!selectedTimelineItem) {
            Logger.debug('No trackItem');
            return null;
        }

        const colorChanged = selectedTimelineItem.color !== trackItem.color;

        if (trayEdit) {
            return (
                <Flex p={1} width={1}>
                    <Box px={1} width={1 / 3}>
                        <Input value={trackItem.app} placeholder="App" onChange={changeAppName} />
                    </Box>
                    <Box px={1} flex="1">
                        <Input
                            value={trackItem.title}
                            placeholder="Title"
                            onChange={changeAppTitle}
                        />
                    </Box>

                    <Box px={1}>
                        <ColorPicker color={trackItem.color} onChange={changeColorHandler} />
                    </Box>

                    <Box px={1}>
                        <Button
                            type="primary"
                            shape="circle"
                            icon={<PlayCircleOutlined />}
                            onClick={saveBasedOnColorOptionHandler}
                        />
                    </Box>

                    <Box px={1}>
                        <Button
                            type="primary"
                            shape="circle"
                            icon={<CloseOutlined />}
                            onClick={closeEdit}
                        />
                    </Box>
                </Flex>
            );
        }

        return (
            <Box width={600}>
                <Flex px={2} width={1} py={1} pt={3}>
                    <Title level={5}>{statusName[trackItem.taskName] || 'New Log item'}</Title>
                </Flex>
                <Flex p={1} width={1}>
                    <Box px={1} width={1 / 3}>
                        <Input value={trackItem.app} placeholder="App" onChange={changeAppName} />
                    </Box>
                    <Box px={1} flex="1">
                        <Input
                            value={trackItem.title}
                            placeholder="Title"
                            onChange={changeAppTitle}
                        />
                    </Box>
                </Flex>
                <Flex p={1} width={1}>
                    <Flex px={1} width={1 / 3}>
                        <Box pr={2}>
                            <ColorPicker color={trackItem.color} onChange={changeColorHandler} />
                        </Box>
                        {colorChanged && (
                            <Tooltip
                                placement="left"
                                title="Can also change color for all items or all future items"
                            >
                                <Select
                                    value={colorScope}
                                    style={{ width: '100%' }}
                                    onChange={changeColorScopeHandler}
                                >
                                    <Select.Option value="ONLY_THIS">This trackItem</Select.Option>
                                    <Select.Option value="NEW_ITEMS">Future items</Select.Option>
                                    <Select.Option value="ALL_ITEMS">All items</Select.Option>
                                </Select>
                            </Tooltip>
                        )}
                    </Flex>

                    <Flex px={1} width={2 / 3}>
                        <Box pr={1}>
                            <TimePicker
                                value={moment(trackItem.beginDate)}
                                onChange={changeTime('beginDate')}
                            />
                        </Box>
                        <Box>
                            <TimePicker
                                value={moment(trackItem.endDate)}
                                onChange={changeTime('endDate')}
                            />
                        </Box>
                    </Flex>
                </Flex>
                <Divider />
                <Flex width={1}>
                    <Box px={1}>
                        <Button icon={<CloseOutlined />} onClick={closeEdit}>
                            Close
                        </Button>
                    </Box>
                    <Box sx={{ flex: 1 }}></Box>
                    <Box px={1}>
                        <Button type="link" icon={<DeleteOutlined />} onClick={showDeleteConfirm}>
                            Delete
                        </Button>
                    </Box>
                    <Box px={1}>
                        <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            onClick={saveBasedOnColorOptionHandler}
                        >
                            Save
                        </Button>
                    </Box>
                </Flex>
            </Box>
        );
    },
);
