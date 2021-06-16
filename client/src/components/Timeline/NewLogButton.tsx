import randomcolor from 'randomcolor';
import React, { memo } from 'react';
import { useStoreActions, useStoreState } from '../../store/easyPeasy';
import { Button } from '@chakra-ui/button';
import { Tooltip } from '@chakra-ui/tooltip';

export const NewLogButton = memo(() => {
    const visibleTimerange = useStoreState(state => state.visibleTimerange);

    const setSelectedTimelineItem = useStoreActions(actions => actions.setSelectedTimelineItem);

    const createNewItem = () => {
        setSelectedTimelineItem({
            color: randomcolor(),
            beginDate: visibleTimerange[0].valueOf(),
            endDate: visibleTimerange[1].valueOf(),
        });
    };

    return (
        <Tooltip
            placement="bottom"
            label="Start creating log with visible timerange as begin and end times."
        >
            <Button onClick={createNewItem}>New Log</Button>
        </Tooltip>
    );
});
