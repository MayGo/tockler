import { reduxForm } from 'redux-form';
import { connect } from 'dva';
import { SettingsForm } from './SettingsForm';

import { compose } from 'recompose';
const mapStateToProps = ({ settings }: any) => ({
    initialValues: settings.work,
});
const mapDispatchToProps = (dispatch: any) => ({
    handleSubmit: e => {
        e.preventDefault();

        dispatch({
            type: 'settings/saveWorkSettings',
        });
    },
});

const enhance = compose(
    connect(mapStateToProps, mapDispatchToProps),
    reduxForm({
        form: 'settingsForm',
    }),
);

export const SettingsFormContainer = enhance(SettingsForm);
