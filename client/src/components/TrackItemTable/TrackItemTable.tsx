import { Box } from '@chakra-ui/react';
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

    const data = filterItems(timeItems[type], visibleTimerange);
    const isOneDay = checkIfOneDay(visibleTimerange);
    const isToday = timerangeMode === TIMERANGE_MODE_TODAY;

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
                sumTotal={0}
                manualSortBy={false}
                customTableButtons={<TrackItemTableButtons {...defaultTableButtonsProps} />}
            />
        </Box>
    );
};
