import { Alert } from 'antd';
import React from 'react';
import { loginInExternalBrowser } from '../services/settings.api';

const LoginAlert = () => {
    return (
        <Alert
            type="warning"
            message="You are currently not logged in to GitStart."
            description="Please login so that your events are synced to GitStart."
            showIcon
            closeText="Login"
            onClose={loginInExternalBrowser}
        />
    );
};

export default LoginAlert;
