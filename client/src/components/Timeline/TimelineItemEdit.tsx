import { TimePicker } from 'antd';

import React, { useState, useEffect, memo } from 'react';
import { ColorPicker } from './ColorPicker';
import { Logger } from '../../logger';
import moment from 'moment';
import { TrackItemType } from '../../enum/TrackItemType';
import { Box, Divider, Flex, Heading } from '@chakra-ui/layout';
import { Input } from '@chakra-ui/input';
import { Button, IconButton } from '@chakra-ui/button';
import { Tooltip } from '@chakra-ui/tooltip';
import { Select } from '@chakra-ui/select';
import { AiOutlineClose, AiOutlinePlayCircle, AiOutlineSave } from 'react-icons/ai';
import { TimelineItemEditDeleteButton } from './TimelineItemEditDeleteButton';

interface IProps {
    selectedTimelineItem: any;
    saveTimelineItem: any;
    changeColorForApp?: any;
    trayEdit?: boolean;
    clearTimelineItem?: any;
    deleteTimelineItem?: any;
}

const COLOR_SCOPE_ONLY_THIS = 'ONLY_THIS';

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

        if (!selectedTimelineItem) {
            Logger.debug('No trackItem');
            return null;
        }

        const colorChanged = selectedTimelineItem.color !== trackItem.color;

        if (trayEdit) {
            return (
                <Flex p={1}>
                    <Box px={1} width="33%">
                        <Input value={trackItem.app} placeholder="App" onChange={changeAppName} />
                    </Box>
                    <Box px={1} flex="1">
                        <Input
                            value={trackItem.title}
                            placeholder="Title"
                            c
                            onChange={changeAppTitle}
                        />
                    </Box>

                    <Box px={1}>
                        <ColorPicker color={trackItem.color} onChange={changeColorHandler} />
                    </Box>

                    <Box px={1}>
                        <IconButton
                            aria-label="start"
                            leftIcon={<AiOutlinePlayCircle />}
                            onClick={saveBasedOnColorOptionHandler}
                        />
                    </Box>

                    <Box px={1}>
                        <IconButton
                            aria-label="stop"
                            leftIcon={<AiOutlineClose />}
                            onClick={closeEdit}
                        />
                    </Box>
                </Flex>
            );
        }

        return (
            <Box width={600}>
                <Flex px={2} py={1} pt={3}>
                    <Heading as="h5" size="sm">
                        {statusName[trackItem.taskName] || 'New Log item'}
                    </Heading>
                </Flex>
                <Flex p={1}>
                    <Box px={1} width="33%">
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
                <Flex p={1}>
                    <Flex px={1} width="33%">
                        <Box pr={2}>
                            <ColorPicker color={trackItem.color} onChange={changeColorHandler} />
                        </Box>
                        {colorChanged && (
                            <Tooltip
                                placement="left"
                                label="Can also change color for all items or all future items"
                            >
                                <Select value={colorScope} onChange={changeColorScopeHandler}>
                                    <option value="ONLY_THIS">This trackItem</option>
                                    <option value="NEW_ITEMS">Future items</option>
                                    <option value="ALL_ITEMS">All items</option>
                                </Select>
                            </Tooltip>
                        )}
                    </Flex>

                    <Flex px={1} width="67%">
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
                <Box py={5}>
                    <Divider />
                </Box>
                <Flex>
                    <Box px={1}>
                        <Button leftIcon={<AiOutlineClose />} onClick={closeEdit}>
                            Close
                        </Button>
                    </Box>
                    <Box flex={1}></Box>
                    <Box px={1}>
                        <TimelineItemEditDeleteButton deleteItem={deleteItem} />
                    </Box>
                    <Box px={1}>
                        <Button
                            leftIcon={<AiOutlineSave />}
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
