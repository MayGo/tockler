import randomcolor from 'randomcolor';
import { memo } from 'react';
import { useStoreActions, useStoreState } from '../../store/easyPeasy';
import { Button } from '@chakra-ui/react';
import { Tooltip } from '@chakra-ui/react';
import { TrackItemType } from '../../enum/TrackItemType';

export const NewLogButton = memo(() => {
    const visibleTimerange = useStoreState((state) => state.visibleTimerange);
    const selectedTimelineItem = useStoreState((state) => state.selectedTimelineItem);

    const setSelectedTimelineItem = useStoreActions((actions) => actions.setSelectedTimelineItem);

    const createNewItem = () => {
        setSelectedTimelineItem({
            app: '',
            title: '',
            taskName: TrackItemType.LogTrackItem,
            color: randomcolor(),
            beginDate: selectedTimelineItem?.beginDate || visibleTimerange[0].valueOf(),
            endDate: selectedTimelineItem?.endDate || visibleTimerange[1].valueOf(),
        });
    };

    return (
        <Tooltip placement="bottom" label="Start creating log with visible timerange as begin and end times.">
            <Button onClick={createNewItem}>New Task</Button>
        </Tooltip>
    );
});
