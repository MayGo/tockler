import { connect } from 'dva';
import { compose } from 'recompose';
import { TrackItemType } from '../../enum/TrackItemType';
import { AnalyserFormItem } from './AnalyserFormItem';

const mapStateToProps = ({ timeline }: any) => ({
    appTrackItems: timeline[TrackItemType.AppTrackItem],
});
const mapDispatchToProps = (dispatch: any) => ({});

const enhance = compose(
    connect(
        mapStateToProps,
        mapDispatchToProps,
    ),
);

export const AnalyserFormItemContainer = enhance(AnalyserFormItem);
