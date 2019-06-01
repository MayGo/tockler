import { connect } from 'dva';
import { compose } from 'recompose';
import { TrackItemType } from '../../enum/TrackItemType';
import { AnalyserForm } from './AnalyserForm';

const mapStateToProps = ({ timeline }: any) => ({
    appItems: timeline[TrackItemType.AppTrackItem],
});
const mapDispatchToProps = (dispatch: any) => ({});

const enhance = compose(
    connect(
        mapStateToProps,
        mapDispatchToProps,
    ),
);

export const AnalyserFormContainer = enhance(AnalyserForm);
