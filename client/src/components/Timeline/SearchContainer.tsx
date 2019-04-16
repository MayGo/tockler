import { connect } from 'dva';

import { Search } from './Search';

const mapStateToProps = ({ timeline }: any) => ({
    timerange: timeline.timerange,
});
const mapDispatchToProps = (dispatch: any) => ({
    loadTimerange: (timerange: any) =>
        dispatch({
            type: 'timeline/loadTimerange',
            payload: { timerange },
        }),
    changeVisibleTimerange: (visibleTimerange: any) =>
        dispatch({
            type: 'timeline/changeVisibleTimerange',
            payload: { visibleTimerange },
        }),
});

export const SearchContainer = connect(
    mapStateToProps,
    mapDispatchToProps,
)(Search);
