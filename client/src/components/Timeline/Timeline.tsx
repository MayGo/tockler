import {
    Box,
    Popover,
    PopoverArrow,
    PopoverBody,
    PopoverContent,
    PopoverTrigger,
    useColorModeValue,
} from '@chakra-ui/react';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useStoreState } from '../../store/easyPeasy';
import { BlackBox } from '../BlackBox';
import { Loader } from './Loader';
import { MainTimelineChart } from './MainTimelineChart';
import { SmallTimelineChart } from './SmallTimelineChart';
import { TimelineItemEdit } from './TimelineItemEdit';

export const Timeline = memo(() => {
    const popoverTriggerRef = useRef<HTMLDivElement>(null);

    const isLoading = useStoreState((state) => state.isLoading);

    const selectedTimelineItem = useStoreState((state) => state.selectedTimelineItem);

    // Horizontal position of the popover anchor; undefined centres it (e.g. "New Task", which has no clicked bar).
    const containerRef = useRef<HTMLDivElement>(null);
    const [anchorX, setAnchorX] = useState<number | undefined>(undefined);
    const handleBarClick = useCallback((clientX: number) => {
        const left = containerRef.current?.getBoundingClientRect().left ?? 0;
        setAnchorX(clientX - left);
    }, []);
    useEffect(() => {
        if (!selectedTimelineItem) {
            setAnchorX(undefined);
        }
    }, [selectedTimelineItem]);

    return (
        <Box flex="1" ref={containerRef}>
            <Box pt={4} pb={4}>
                <BlackBox position="relative">
                    {isLoading && <Loader />}
                    <MainTimelineChart onBarClick={handleBarClick} />
                </BlackBox>
                <Box position="relative" h={0}>
                    <Popover isOpen={!!selectedTimelineItem}>
                        <PopoverTrigger>
                            <Box
                                ref={popoverTriggerRef}
                                position="absolute"
                                top={0}
                                left={anchorX === undefined ? '50%' : `${anchorX}px`}
                                w="1px"
                                h="1px"
                            />
                        </PopoverTrigger>
                        <PopoverContent
                            p={4}
                            w="fit-content"
                            boxShadow="2xl"
                            bg={useColorModeValue('gray.200', 'gray.700')}
                        >
                            <PopoverArrow bg={useColorModeValue('gray.200', 'gray.700')} />
                            <PopoverBody p={0}>
                                <TimelineItemEdit />
                            </PopoverBody>
                        </PopoverContent>
                    </Popover>
                </Box>
            </Box>
            <Box pb={4}>
                <BlackBox position="relative">
                    {isLoading && <Loader />}
                    <SmallTimelineChart />
                </BlackBox>
            </Box>
        </Box>
    );
});
