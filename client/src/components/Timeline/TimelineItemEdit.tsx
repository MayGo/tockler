import React, { useState, useEffect, memo } from 'react';
import { TimeOutput } from 'react-timekeeper';
import randomcolor from 'randomcolor';
import { ColorPicker } from './ColorPicker';
import { Logger } from '../../logger';
import moment from 'moment';
import { TrackItemType } from '../../enum/TrackItemType';
import { Box, Divider, Heading } from '@chakra-ui/layout';
import { Input } from '@chakra-ui/input';
import { Button, IconButton } from '@chakra-ui/button';
import { Tooltip } from '@chakra-ui/tooltip';
import { Select } from '@chakra-ui/select';
import { AiOutlineClose, AiOutlineSave } from 'react-icons/ai';
import { TimelineItemEditDeleteButton } from './TimelineItemEditDeleteButton';
import { TIME_FORMAT_SHORT } from '../../constants';
import { TimePicker } from './TimePicker';
import { HStack, VStack } from '@chakra-ui/react';
import { FaPlay } from 'react-icons/fa';
import { ITEM_TYPES } from '../../utils';

interface IProps {
    selectedTimelineItem: any;
    saveTimelineItem: any;
    changeColorForApp?: any;
    trayEdit?: boolean;
    clearTimelineItem?: any;
    deleteTimelineItem?: any;
}

const COLOR_SCOPE_ONLY_THIS = 'ONLY_THIS';

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
        const changeTime = attr => (value: TimeOutput) => {
            Logger.debug('Changed app time:', value);
            const oldDate = moment(state.trackItem[attr]);
            const newDate = oldDate
                .startOf('day')
                .set('hours', value.hour)
                .set('minutes', value.minute);

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
            setState({
                ...state,
                trackItem: {
                    ...state.trackItem,
                    app: '',
                    title: '',
                    color: randomcolor(),
                },
            });
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

        const onSubmit = event => {
            event.preventDefault();
            saveBasedOnColorOptionHandler();
        };
        if (trayEdit) {
            return (
                <form onSubmit={onSubmit}>
                    <HStack spacing={4}>
                        <Box width="33%">
                            <Input
                                value={trackItem.app}
                                placeholder="App"
                                onChange={changeAppName}
                            />
                        </Box>
                        <Box flex="1">
                            <Input
                                value={trackItem.title}
                                placeholder="Title"
                                onChange={changeAppTitle}
                            />
                        </Box>

                        <ColorPicker color={trackItem.color} onChange={changeColorHandler} />

                        <IconButton type="submit" aria-label="start" icon={<FaPlay />} />
                    </HStack>
                </form>
            );
        }

        const isCreating = !selectedTimelineItem.id;

        return (
            <Box width={600}>
                <VStack alignItems="flex-start" spacing={4}>
                    <Heading fontSize="xl" pb={2}>
                        {ITEM_TYPES[trackItem.taskName] || 'New Task'}
                    </Heading>
                    <HStack width="100%" spacing={4}>
                        <Box flex="2">
                            <Input
                                value={trackItem.app}
                                placeholder="App"
                                onChange={changeAppName}
                            />
                        </Box>
                        <Box flex="1" maxWidth="100px">
                            <TimePicker
                                time={moment(trackItem.beginDate).format(TIME_FORMAT_SHORT)}
                                onChange={changeTime('beginDate')}
                            />
                        </Box>
                        <Box flex="1" maxWidth="100px">
                            <TimePicker
                                time={moment(trackItem.endDate).format(TIME_FORMAT_SHORT)}
                                onChange={changeTime('endDate')}
                            />
                        </Box>
                    </HStack>
                    <Box w="100%">
                        <Input
                            value={trackItem.title}
                            placeholder="Title"
                            onChange={changeAppTitle}
                        />
                    </Box>
                    <HStack>
                        <Box>
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
                    </HStack>
                </VStack>

                <Box py={4}>
                    <Divider />
                </Box>
                <HStack spacing={4}>
                    {!isCreating && (
                        <Box>
                            <TimelineItemEditDeleteButton deleteItem={deleteItem} />
                        </Box>
                    )}
                    <Box flex={1}></Box>

                    <Button variant="outline" leftIcon={<AiOutlineClose />} onClick={closeEdit}>
                        Cancel
                    </Button>

                    <Button leftIcon={<AiOutlineSave />} onClick={saveBasedOnColorOptionHandler}>
                        {isCreating ? 'Create' : 'Update'}
                    </Button>
                </HStack>
            </Box>
        );
    },
);
