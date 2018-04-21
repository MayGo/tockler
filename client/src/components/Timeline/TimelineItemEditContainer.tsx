import { connect } from 'dva';
import { TimelineItemEdit } from './TimelineItemEdit';

const mapStateToProps = ({ timeline }: any) => ({
    selectedTimelineItem: timeline.selectedTimelineItem,
});
const mapDispatchToProps = (dispatch: any) => ({
    saveTimelineItem: (item: any, colorScope: string) =>
        dispatch({
            type: 'timeline/saveTimelineItem',
            payload: { item, colorScope },
        }),

    clearTimelineItem: (item: any, colorScope: string) =>
        dispatch({
            type: 'timeline/selectTimelineItem',
            payload: {},
        }),
});

export const TimelineItemEditContainer = connect(mapStateToProps, mapDispatchToProps)(
    TimelineItemEdit,
);
