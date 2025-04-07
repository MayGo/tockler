import { Box } from '@chakra-ui/react';
import { differenceInMilliseconds } from 'date-fns';
import { sumBy } from 'lodash';
import { ITrackItem } from '../../@types/ITrackItem';
import { useStoreActions, useStoreState } from '../../store/easyPeasy';
import { TIMERANGE_MODE_TODAY } from '../../store/mainStore';
import { checkIfOneDay } from '../../timeline.util';
import { filterItems } from '../Timeline/timeline.utils';
import { ItemsTable } from './ItemsTable';
import { defaultTableButtonsProps } from './TrackItemTable.utils';
import { TrackItemTableButtons } from './TrackItemTableButtons';

export const TrackItemTable = ({ type, resetButtonsRef }) => {
    const timeItems = useStoreState((state) => state.timeItems);
    const visibleTimerange = useStoreState((state) => state.visibleTimerange);
    const timerangeMode = useStoreState((state) => state.timerangeMode);
    const setLiveView = useStoreActions((actions) => actions.setLiveView);

    // Use the first 10 items for the current page (since we're not doing server-side pagination here)
    const data = filterItems(timeItems[type], visibleTimerange);

    const isOneDay = checkIfOneDay(visibleTimerange);
    const isToday = timerangeMode === TIMERANGE_MODE_TODAY;

    // Calculate total duration in milliseconds for all the data
    const totalDuration = sumBy(timeItems[type] as ITrackItem[], (trackItem) => {
        return differenceInMilliseconds(trackItem.endDate, trackItem.beginDate);
    });

    const handleClick = (e) => {
        e.stopPropagation();

        if (isToday) {
            setLiveView(false);
        }
    };

    return (
        <Box position="relative" onClick={handleClick}>
            <ItemsTable
                data={data}
                resetButtonsRef={resetButtonsRef}
                isOneDay={isOneDay}
                isSearchTable={false}
                sumTotal={totalDuration}
                manualSortBy={false}
                customTableButtons={<TrackItemTableButtons {...defaultTableButtonsProps} />}
            />
        </Box>
    );
};
