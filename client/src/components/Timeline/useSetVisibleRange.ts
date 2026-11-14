import { DateTime } from 'luxon';
import { useCallback } from 'react';
import { useStoreActions, useStoreState } from '../../store/easyPeasy';
import { TIMERANGE_MODE_TODAY } from '../../store/mainStore';
import { fitRangeInto } from './timeline.utils';

/**
 * Set the visible range from a user action, kept inside the loaded day.
 * Live view re-centres the range on "now" every few seconds and keeps only its length, so a range that picks a
 * specific part of the day (AM, PM, typed times, brush) has to switch live view off or it would be moved away.
 */
export const useSetVisibleRange = () => {
    const timerange = useStoreState((state) => state.timerange);
    const timerangeMode = useStoreState((state) => state.timerangeMode);
    const setVisibleTimerange = useStoreActions((actions) => actions.setVisibleTimerange);
    const setLiveView = useStoreActions((actions) => actions.setLiveView);

    return useCallback(
        (range: DateTime[], { pinsPosition }: { pinsPosition: boolean }) => {
            if (pinsPosition && timerangeMode === TIMERANGE_MODE_TODAY) {
                setLiveView(false);
            }
            setVisibleTimerange(fitRangeInto(timerange, range));
        },
        [timerange, timerangeMode, setVisibleTimerange, setLiveView],
    );
};
