import { useState, useEffect, memo } from 'react';
import randomcolor from 'randomcolor';
import { ColorPicker } from './ColorPicker';
import { Logger } from '../../logger';
import moment from 'moment';
import { Box, Divider, Heading } from '@chakra-ui/react';
import { Input } from '@chakra-ui/react';
import { Button } from '@chakra-ui/react';
import { Tooltip } from '@chakra-ui/react';
import { Select } from '@chakra-ui/react';
import { AiOutlineClose, AiOutlineSave } from 'react-icons/ai';
import { TimelineItemEditDeleteButton } from './TimelineItemEditDeleteButton';
import { TIME_FORMAT_SHORT } from '../../constants';

import { HStack, VStack } from '@chakra-ui/react';
import { ITEM_TYPES } from '../../utils';
import { changeColorForApp } from '../../services/appSettings.api';
import { saveTrackItem, deleteByIds, updateTrackItemColor } from '../../services/trackItem.api';
import { useStoreActions, useStoreState } from '../../store/easyPeasy';
import { TrackItemType } from '../../enum/TrackItemType';

const COLOR_SCOPE_ONLY_THIS = 'ONLY_THIS';

export const TimelineItemEdit = memo(() => {
    const selectedTimelineItem = useStoreState((state) => state.selectedTimelineItem);
    const setSelectedTimelineItem = useStoreActions((actions) => actions.setSelectedTimelineItem);
    const fetchTimerange = useStoreActions((actions) => actions.fetchTimerange);

    const [state, setState] = useState<any>({
        trackItem: selectedTimelineItem,
        colorScope: COLOR_SCOPE_ONLY_THIS,
    });

    const { trackItem, colorScope } = state;

    const deleteTimelineItem = async () => {
        const id = trackItem.id;
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
        try {
            if (colorScope === 'ALL_ITEMS') {
                await changeColorForApp(trackItem.app, trackItem.color);
                await updateTrackItemColor(trackItem.app, trackItem.color);
            } else if (colorScope === 'NEW_ITEMS') {
                await changeColorForApp(trackItem.app, trackItem.color);
                await saveTrackItem(trackItem);
            } else {
                await saveTrackItem(trackItem);
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

        setState((oldState) => ({
            ...oldState,
            trackItem: {
                ...oldState.trackItem,
                color,
            },
        }));
    };

    const changeAppName = (e) => {
        const { value } = e.target;
        Logger.debug('Changed app name:', value);

        setState((oldState) => ({
            ...oldState,
            trackItem: {
                ...oldState.trackItem,
                app: value,
            },
        }));
    };

    const changeTime = (attr) => (timeStr: string) => {
        Logger.debug('Changed app time:', timeStr);
        const [hours, minutes] = timeStr.split(':').map(Number);
        const oldDate = moment(state.trackItem[attr]);
        const newDate = oldDate.startOf('day').set('hours', hours).set('minutes', minutes);

        setState((oldState) => ({
            ...oldState,
            trackItem: {
                ...oldState.trackItem,
                [attr]: newDate.valueOf(),
            },
        }));
    };

    const changeAppTitle = (e) => {
        const { value } = e.target;
        Logger.debug('Changed app title:', value);

        setState((oldState) => ({
            ...oldState,
            trackItem: {
                ...oldState.trackItem,
                title: value,
            },
        }));
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
        setState((oldState) => ({
            ...oldState,
            trackItem: {
                ...oldState.trackItem,
                app: '',
                title: '',
                color: randomcolor(),
            },
        }));
    };

    if (!selectedTimelineItem || !trackItem) {
        Logger.debug('No trackItem');
        return null;
    }

    const colorChanged = selectedTimelineItem.color !== trackItem.color;
    const isCreating = !selectedTimelineItem.id;

    return (
        <Box width={600}>
            <VStack alignItems="flex-start" spacing={4}>
                <Heading fontSize="xl" pb={2}>
                    {ITEM_TYPES[trackItem.taskName] || 'New Task'}
                </Heading>
                <HStack width="100%" spacing={4}>
                    <Box flex="2">
                        <Input value={trackItem.app} placeholder="App" onChange={changeAppName} readOnly={readOnly} />
                    </Box>
                    <Box flex="1" maxWidth="120px">
                        <Input
                            type="time"
                            value={moment(trackItem.beginDate).format(TIME_FORMAT_SHORT)}
                            onChange={(e) => changeTime('beginDate')(e.target.value)}
                            readOnly={readOnly}
                        />
                    </Box>
                    <Box flex="1" maxWidth="120px">
                        <Input
                            type="time"
                            value={moment(trackItem.endDate).format(TIME_FORMAT_SHORT)}
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
