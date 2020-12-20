import React, { memo } from 'react';
import { changeColorForApp } from '../../services/appSettings.api';
import { saveTrackItem, deleteByIds, updateTrackItemColor } from '../../services/trackItem.api';
import { TimelineItemEdit } from './TimelineItemEdit';
import { Logger } from '../../logger';
import { useStoreActions, useStoreState } from '../../store/easyPeasy';

export const TimelineItemEditContainer = memo(() => {
    const selectedTimelineItem = useStoreState(state => state.selectedTimelineItem);
    const setSelectedTimelineItem = useStoreActions(actions => actions.setSelectedTimelineItem);
    const fetchTimerange = useStoreActions(actions => actions.fetchTimerange);

    const deleteTimelineItem = async trackItem => {
        const id = trackItem.id;
        Logger.debug('Delete timeline trackItem', id);

        if (id) {
            await deleteByIds([id]);
            Logger.debug('Deleted timeline items', id);
            fetchTimerange();
            setSelectedTimelineItem(null);
        } else {
            Logger.error('No ids, not deleting from DB');
        }
    };

    const saveTimelineItem = async (trackItem, colorScope) => {
        Logger.debug('Updating color for trackItem', trackItem, colorScope);
        if (colorScope === 'ALL_ITEMS') {
            await changeColorForApp(trackItem.app, trackItem.color);
            await updateTrackItemColor(trackItem.app, trackItem.color);
        } else if (colorScope === 'NEW_ITEMS') {
            await changeColorForApp(trackItem.app, trackItem.color);
            await saveTrackItem(trackItem);
        } else {
            await saveTrackItem(trackItem);
        }

        setSelectedTimelineItem(null);
        fetchTimerange();
    };

    const clearTimelineItem = () => setSelectedTimelineItem(null);

    const moreProps = {
        deleteTimelineItem,
        clearTimelineItem,
        saveTimelineItem,
    };
    return <TimelineItemEdit selectedTimelineItem={selectedTimelineItem} {...moreProps} />;
});
