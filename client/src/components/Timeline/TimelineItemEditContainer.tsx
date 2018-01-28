import { connect } from 'dva';
import { TimelineItemEdit } from './TimelineItemEdit';

const mapStateToProps = ({ timeline }: any) => ({
    selectedTimelineItem: timeline.selectedTimelineItem,
});
const mapDispatchToProps = (dispatch: any) => ({
    saveTimelineItem: (item: any) =>
        dispatch({
            type: 'timeline/saveTimelineItem',
            payload: { item },
        }),
});

export const TimelineItemEditContainer = connect(mapStateToProps, mapDispatchToProps)(
    TimelineItemEdit,
);
