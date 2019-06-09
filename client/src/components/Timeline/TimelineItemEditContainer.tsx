import * as React from 'react';
import { AppSettingService } from '../../services/AppSettingService';
import { TrackItemService } from '../../services/TrackItemService';
import { TimelineItemEdit } from './TimelineItemEdit';

export const TimelineItemEditContainer = props => {
    const { setSelectedTimelineItem } = props;
    const deleteTimelineItem = id => {
        console.debug('Delete timeline item', id);

        if (id) {
            TrackItemService.deleteByIds(id).then(() => {
                console.debug('Deleted timeline items', id);
                // TODO: reload timerange or remove from timeline
            });
            setSelectedTimelineItem(null);
        } else {
            console.error('No ids, not deleting from DB');
        }
    };

    const saveTimelineItem = async ({ item, colorScope }) => {
        console.log('Updating color for trackItem', item, colorScope);
        if (colorScope === 'ALL_ITEMS') {
            await AppSettingService.changeColorForApp(item.app, item.color);
            await TrackItemService.updateColorForApp(item.app, item.color);
        } else if (colorScope === 'NEW_ITEMS') {
            await AppSettingService.changeColorForApp(item.app, item.color);
            await TrackItemService.saveTrackItem(item);
        } else {
            await TrackItemService.saveTrackItem(item);
        }

        setSelectedTimelineItem(null);
        // TODO: reload items
    };

    const clearTimelineItem = () => setSelectedTimelineItem(null);

    React.useEffect(() => {});

    const moreProps = {
        deleteTimelineItem,
        clearTimelineItem,
        saveTimelineItem,
    };
    return <TimelineItemEdit {...props} {...moreProps} />;
};
