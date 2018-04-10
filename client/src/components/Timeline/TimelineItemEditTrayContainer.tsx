import { connect } from 'dva';
import { TimelineItemEdit } from './TimelineItemEdit';

const DEFAULT = {};
const mapStateToProps = ({ tray }: any) => ({
    selectedTimelineItem: DEFAULT,
    colorScopeHidden: true,
});
const mapDispatchToProps = (dispatch: any) => ({
    saveTimelineItem: (item: any, colorScope: any) =>
        dispatch({
            type: 'tray/startNewLogItem',
            payload: { item },
        }),
});

export const TimelineItemEditTrayContainer = connect(mapStateToProps, mapDispatchToProps)(
    TimelineItemEdit,
);
