import { memo, useRef } from 'react';
import { TimelineItemEdit } from './TimelineItemEdit';
import { useStoreState } from '../../store/easyPeasy';
import { Popover, PopoverArrow, PopoverBody, PopoverContent, PopoverTrigger } from '@chakra-ui/react';
import { Box } from '@chakra-ui/react';
import { BlackBox } from '../BlackBox';
import { MainTimelineChart } from './MainTimelineChart';
import { SmallTimelineChart } from './SmallTimelineChart';
import { Loader } from './Loader';

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
                    <PopoverContent p={4} w="fit-content" boxShadow="lg" bg="gray.50">
                        <PopoverArrow bg="gray.50" />
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
