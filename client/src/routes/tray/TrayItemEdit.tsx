import { useState, useEffect } from 'react';
import randomcolor from 'randomcolor';
import { Logger } from '../../logger';
import { Box } from '@chakra-ui/react';
import { Input } from '@chakra-ui/react';
import { IconButton } from '@chakra-ui/react';
import { FaPlay } from 'react-icons/fa';
import { HStack } from '@chakra-ui/react';
import { ColorPicker } from '../../components/Timeline/ColorPicker';
import { useWindowFocused } from '../../hooks/windowFocusedHook';

const COLOR_SCOPE_ONLY_THIS = 'ONLY_THIS';
const EMPTY_SELECTED_ITEM = { app: '', title: '', color: randomcolor() };

export const TrayItemEdit = ({ saveTimelineItem }) => {
    const { windowIsActive } = useWindowFocused();
    const [trackItem, setTrackItem] = useState(EMPTY_SELECTED_ITEM);

    useEffect(() => {
        if (windowIsActive) {
            setTrackItem((oldItem) => ({ ...oldItem, color: randomcolor() }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [windowIsActive]);

    const changeColorHandler = (color) => {
        Logger.debug('Changed color:', color);

        setTrackItem((oldItem) => ({ ...oldItem, color }));
    };

    const changeAppName = (e) => {
        const { value } = e.target;
        setTrackItem((oldItem) => ({ ...oldItem, app: value }));
    };

    const changeAppTitle = (e) => {
        const { value } = e.target;

        setTrackItem((oldItem) => ({ ...oldItem, title: value }));
    };

    const onSubmit = (event) => {
        event.preventDefault();

        saveTimelineItem(trackItem, COLOR_SCOPE_ONLY_THIS);
        setTrackItem((oldItem) => ({ ...oldItem, app: '', title: '', color: randomcolor() }));
    };

    return (
        <form onSubmit={onSubmit}>
            <HStack spacing={4}>
                <Box width="33%">
                    <Input value={trackItem.app} placeholder="App" onChange={changeAppName} />
                </Box>
                <Box flex="1">
                    <Input value={trackItem.title} placeholder="Title" onChange={changeAppTitle} />
                </Box>

                <ColorPicker color={trackItem.color} onChange={changeColorHandler} />

                <IconButton type="submit" aria-label="start" icon={<FaPlay />} />
            </HStack>
        </form>
    );
};
