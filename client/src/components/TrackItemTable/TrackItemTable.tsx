import { Box, Button, Text } from '@chakra-ui/react';
import { useMemo } from 'react';
import { ITrackItem } from '../../@types/ITrackItem';
import { useStoreActions, useStoreState } from '../../store/easyPeasy';
import { TIMERANGE_MODE_TODAY } from '../../store/mainStore';
import { checkIfOneDay } from '../../timeline.util';
import { filterItems } from '../Timeline/timeline.utils';
import { matchesTitleKeyword } from '../Timeline/titleSearch.utils';
import { useTitleSearchMatches } from '../Timeline/useTitleSearchMatches';
import { ItemsTable } from './ItemsTable';
import { defaultTableButtonsProps } from './TrackItemTable.utils';
import { TrackItemTableButtons } from './TrackItemTableButtons';

const EMPTY_ARRAY: ITrackItem[] = [];

const totalDurationMs = (items: ITrackItem[]) =>
    items.reduce((total, item) => total + (item.endDate - item.beginDate), 0);

export const TrackItemTable = ({ type, resetButtonsRef }) => {
    const items: ITrackItem[] = useStoreState((state) => state.timeItems[type]) || EMPTY_ARRAY;
    const visibleTimerange = useStoreState((state) => state.visibleTimerange);
    const timerangeMode = useStoreState((state) => state.timerangeMode);
    const setLiveView = useStoreActions((actions) => actions.setLiveView);
    const setTitleSearch = useStoreActions((actions) => actions.setTitleSearch);
    const { keyword } = useTitleSearchMatches();

    const visibleItems = useMemo(() => filterItems(items, visibleTimerange), [items, visibleTimerange]);
    const data = useMemo(
        () => (keyword ? visibleItems.filter((item) => matchesTitleKeyword(item, keyword)) : visibleItems),
        [visibleItems, keyword],
    );
    const totalDuration = useMemo(() => totalDurationMs(visibleItems), [visibleItems]);

    const isOneDay = checkIfOneDay(visibleTimerange);
    const isToday = timerangeMode === TIMERANGE_MODE_TODAY;

    const handleClick = (e) => {
        e.stopPropagation();

        if (isToday) {
            setLiveView(false);
        }
    };

    const footerNote = keyword ? (
        <Text as="span">
            Only titles containing “{keyword}”{' '}
            <Button size="xs" variant="link" onClick={() => setTitleSearch('')}>
                Show all
            </Button>
        </Text>
    ) : null;

    return (
        <Box position="relative" onClick={handleClick}>
            <ItemsTable
                data={data}
                resetButtonsRef={resetButtonsRef}
                isOneDay={isOneDay}
                isSearchTable={false}
                sumTotal={totalDuration}
                manualSortBy={false}
                footerNote={footerNote}
                customTableButtons={<TrackItemTableButtons {...defaultTableButtonsProps} />}
            />
        </Box>
    );
};
