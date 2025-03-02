import {
    Box,
    Popover,
    PopoverArrow,
    PopoverBody,
    PopoverContent,
    PopoverTrigger,
    useColorModeValue,
} from '@chakra-ui/react';
import { memo, useRef } from 'react';
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

    return (
        <Box flex="1">
            <Box pt={4} pb={4}>
                <BlackBox position="relative">
                    {isLoading && <Loader />}
                    <MainTimelineChart />
                </BlackBox>
                <Popover isOpen={!!selectedTimelineItem}>
                    <PopoverTrigger>
                        <div ref={popoverTriggerRef} />
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
            <Box pb={4}>
                <BlackBox position="relative">
                    {isLoading && <Loader />}
                    <SmallTimelineChart />
                </BlackBox>
            </Box>
        </Box>
    );
});
