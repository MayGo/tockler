import { reduxForm } from 'redux-form';
import { connect } from 'dva';
import { compose } from 'recompose';
import { AppForm } from './AppForm';

const mapStateToProps = ({ settings }: any) => ({
    initialValues: settings,
});
const mapDispatchToProps = (dispatch: any) => ({});

const enhance = compose(
    connect(
        mapStateToProps,
        mapDispatchToProps,
    ),
    reduxForm({
        form: 'settingsForm',
    }),
);

export const AppFormContainer = enhance(AppForm);
