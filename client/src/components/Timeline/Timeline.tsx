import React, { memo, useRef } from 'react';
import 'moment-duration-format';
import { TimelineItemEditContainer } from './TimelineItemEditContainer';
import { useStoreState } from '../../store/easyPeasy';
import {
    Popover,
    PopoverArrow,
    PopoverBody,
    PopoverContent,
    PopoverTrigger,
} from '@chakra-ui/popover';
import { Box } from '@chakra-ui/react';
import { BlackBox } from '../BlackBox';
import { MainTimelineChart } from './MainTimelineChart';
import { SmallTimelineChart } from './SmallTimelineChart';
import { Loader } from './Loader';

export const Timeline = memo(() => {
    const popoverTriggerRef = useRef();

    const isLoading = useStoreState(state => state.isLoading);

    const selectedTimelineItem = useStoreState(state => state.selectedTimelineItem);

    return (
        <Box flex="1" overflow="hidden">
            <Box pt={4} pb={4}>
                <Popover isOpen={!!selectedTimelineItem}>
                    <PopoverTrigger>{popoverTriggerRef.current || <div />}</PopoverTrigger>
                    <PopoverContent p={5} w="fit-content">
                        <PopoverArrow />
                        <PopoverBody>
                            <TimelineItemEditContainer />
                        </PopoverBody>
                    </PopoverContent>
                </Popover>
                <BlackBox position="relative">
                    {isLoading && <Loader />}
                    <MainTimelineChart />
                </BlackBox>
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
