import React from 'react';
import { getAuthToken } from '../../services/settings.api';

export function AuthBanner() {
    const authToken = getAuthToken();
    const authWithBrowser = () => {
        window.open(
            'https://app.gitstart.dev/redirect?url=x-gitstart-devtime://set-token',
            '_blank',
        );
    };

    if (authToken) {
        return null;
    }

    return (
        <div
            style={{
                width: '100%',
                height: '10%',
            }}
        >
            <button onClick={authWithBrowser}>Login</button>
        </div>
    );
}
