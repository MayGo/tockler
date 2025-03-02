import { Box, Button, Divider, Heading, Input, Select, Text, Tooltip } from '@chakra-ui/react';
import { DateTime } from 'luxon';
import randomcolor from 'randomcolor';
import { memo, useEffect, useState } from 'react';
import { AiOutlineClose, AiOutlineSave } from 'react-icons/ai';
import { TIME_FORMAT_SHORT } from '../../constants';
import { Logger } from '../../logger';
import { ColorPicker } from './ColorPicker';
import { TimelineItemEditDeleteButton } from './TimelineItemEditDeleteButton';

import { HStack, VStack } from '@chakra-ui/react';
import { ITrackItem, SelectedTrackItem } from '../../@types/ITrackItem';
import { TrackItemType } from '../../enum/TrackItemType';
import { changeColorForApp } from '../../services/appSettings.api';
import { deleteByIds, saveTrackItem, updateTrackItemColor } from '../../services/trackItem.api';
import { useStoreActions, useStoreState } from '../../store/easyPeasy';
import { ITEM_TYPES } from '../../utils';

type ColorScope = 'ONLY_THIS' | 'NEW_ITEMS' | 'ALL_ITEMS';

const COLOR_SCOPE_ONLY_THIS: ColorScope = 'ONLY_THIS';

export const TimelineItemEdit = memo(() => {
    const selectedTimelineItem = useStoreState((state) => state.selectedTimelineItem);
    const setSelectedTimelineItem = useStoreActions((actions) => actions.setSelectedTimelineItem);
    const fetchTimerange = useStoreActions((actions) => actions.fetchTimerange);

    const [state, setState] = useState<{
        trackItem: SelectedTrackItem | null;
        colorScope: ColorScope;
    }>({
        trackItem: selectedTimelineItem,
        colorScope: COLOR_SCOPE_ONLY_THIS,
    });

    const { trackItem, colorScope } = state;

    const deleteTimelineItem = async () => {
        const id = trackItem?.id;
        Logger.debug('Delete timeline trackItem', id);

        if (id) {
            await deleteByIds([id]);
            Logger.debug('Deleted timeline items', id);
            fetchTimerange();
            setSelectedTimelineItem(null);
        } else {
            Logger.error('No ids, not deleting from DB');
        }
    };

    const readOnly = selectedTimelineItem?.taskName !== TrackItemType.LogTrackItem;

    const saveTimelineItem = async () => {
        Logger.debug('Updating color for trackItem', trackItem, colorScope);
        if (!trackItem) {
            Logger.error('No trackItem');
            return;
        }
        try {
            const color = trackItem.color || randomcolor();
            if (colorScope === 'ALL_ITEMS') {
                await changeColorForApp(trackItem.app, color);
                await updateTrackItemColor(trackItem.app, color);
            } else if (colorScope === 'NEW_ITEMS') {
                await changeColorForApp(trackItem.app, color);
                await saveTrackItem(trackItem as ITrackItem);
            } else {
                await saveTrackItem(trackItem as ITrackItem);
            }
        } catch (error) {
            Logger.error('Saving track item failed', error);
        }

        setSelectedTimelineItem(null);
        fetchTimerange();
    };

    const clearTimelineItem = () => setSelectedTimelineItem(null);

    useEffect(() => {
        Logger.debug('Selected timelineitem changed:', selectedTimelineItem);

        setState({
            trackItem: selectedTimelineItem,
            colorScope: COLOR_SCOPE_ONLY_THIS,
        });
    }, [selectedTimelineItem]);

    const changeColorHandler = (color) => {
        Logger.debug('Changed color:', color);

        setState((oldState) => {
            if (!oldState.trackItem) return oldState;
            return {
                ...oldState,
                trackItem: {
                    ...oldState.trackItem,
                    color,
                } as ITrackItem,
            };
        });
    };

    const changeAppName = (e) => {
        const { value }: { value: string } = e.target;
        Logger.debug('Changed app name:', value);

        setState((oldState) => {
            if (!oldState.trackItem) return oldState;
            return {
                ...oldState,
                trackItem: {
                    ...oldState.trackItem,
                    app: value,
                } as ITrackItem,
            };
        });
    };

    const changeTime = (attr) => (timeStr: string) => {
        Logger.debug('Changed app time:', timeStr);
        const [hours, minutes] = timeStr.split(':').map(Number);
        const oldDate = DateTime.fromJSDate(new Date(state.trackItem?.[attr] || 0));
        const newDate = oldDate.startOf('day').set({ hour: hours, minute: minutes });

        setState((oldState) => {
            if (!oldState.trackItem) return oldState;
            return {
                ...oldState,
                trackItem: {
                    ...oldState.trackItem,
                    [attr]: newDate.toMillis(),
                } as ITrackItem,
            };
        });
    };

    const changeAppTitle = (e) => {
        const { value } = e.target;
        Logger.debug('Changed app title:', value);

        setState((oldState) => {
            if (!oldState.trackItem) return oldState;
            return {
                ...oldState,
                trackItem: {
                    ...oldState.trackItem,
                    title: value,
                } as ITrackItem,
            };
        });
    };

    const closeEdit = () => {
        Logger.debug('Close TimelineItem');
        clearTimelineItem();
    };

    const changeColorScopeHandler = (e) => {
        const { value } = e.target;
        Logger.debug('Changed color scope:', value);

        setState((oldState) => ({
            ...oldState,
            colorScope: value,
        }));
    };

    const saveBasedOnColorOptionHandler = () => {
        saveTimelineItem();
        setState((oldState) => {
            if (!oldState.trackItem) return oldState;
            return {
                ...oldState,
                trackItem: {
                    ...oldState.trackItem,
                    app: '',
                    title: '',
                    color: randomcolor(),
                } as ITrackItem,
            };
        });
    };

    if (!selectedTimelineItem || !trackItem) {
        Logger.debug('No trackItem');
        return null;
    }

    const colorChanged = selectedTimelineItem.color !== trackItem.color;
    const isCreating = !selectedTimelineItem.id;

    console.log('trackItem', trackItem);

    return (
        <Box width={600}>
            <VStack alignItems="flex-start" spacing={4}>
                <Heading fontSize="xl" pb={2}>
                    {trackItem.id && trackItem.taskName ? ITEM_TYPES[trackItem.taskName] : 'New Task'}
                </Heading>
                <HStack width="100%" spacing={4}>
                    <Box flex="2">
                        <Input value={trackItem.app} placeholder="App" onChange={changeAppName} readOnly={readOnly} />
                    </Box>
                    <Box flex="1" maxWidth="120px">
                        <Input
                            type="time"
                            value={DateTime.fromJSDate(new Date(trackItem.beginDate)).toFormat(TIME_FORMAT_SHORT)}
                            onChange={(e) => changeTime('beginDate')(e.target.value)}
                            readOnly={readOnly}
                        />
                    </Box>
                    <Text fontSize="md">➜</Text>
                    <Box flex="1" maxWidth="120px">
                        <Input
                            type="time"
                            value={DateTime.fromJSDate(new Date(trackItem.endDate)).toFormat(TIME_FORMAT_SHORT)}
                            onChange={(e) => changeTime('endDate')(e.target.value)}
                            readOnly={readOnly}
                        />
                    </Box>
                </HStack>
                <Box w="100%">
                    <Input value={trackItem.title} placeholder="Title" onChange={changeAppTitle} readOnly={readOnly} />
                </Box>
                <HStack>
                    <Box>
                        <ColorPicker color={trackItem.color} onChange={changeColorHandler} />
                    </Box>
                    {colorChanged && (
                        <Tooltip placement="left" label="Can also change color for all items or all future items">
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
                        <TimelineItemEditDeleteButton deleteItem={deleteTimelineItem} />
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
});
