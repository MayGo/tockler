import { reduxForm } from 'redux-form';
import { connect } from 'dva';
import { compose } from 'recompose';
import { WorkForm } from './WordForm';

const mapStateToProps = ({ settings }: any) => ({
    initialValues: settings,
});
const mapDispatchToProps = (dispatch: any) => ({});

const enhance = compose(
    reduxForm({
        form: 'settingsForm',
    }),
    connect(
        mapStateToProps,
        mapDispatchToProps,
    ),
);

export const WorkFormContainer = enhance(WorkForm);
