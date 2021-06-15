import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter as Router } from 'react-router-dom';
import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';
import 'typeface-berkshire-swash';
import { MainRouter } from './router';
import { setupFrontendListener } from 'eiphop';
import { AppDataProvider } from './routes/AppDataProvider';
import { StoreProvider } from 'easy-peasy';
import { mainStore } from './store/mainStore';
require('dotenv').config();

(window as any).CSPSettings = {
    nonce: 'nonce',
};
const { ipcRenderer } = window as any;

Sentry.init({ 
    dsn: process.env.REACT_APP_SENTRY_DSN,
    integrations: [new Integrations.BrowserTracing()],
    tracesSampleRate: 1.0,
    environment: process.env.NODE_ENV,
});
console.log('init');
console.log(process.env);

setupFrontendListener({ ipcRenderer } as any);

if (process.env.NODE_ENV !== 'production') {
    const whyDidYouRender = require('@welldone-software/why-did-you-render');
    whyDidYouRender(React);
}

ReactDOM.render(
        <StoreProvider store={mainStore}>
            <AppDataProvider>
                <Router>
                    <MainRouter />
                </Router>
            </AppDataProvider>
        </StoreProvider>,
    document.getElementById('root') as HTMLElement,
);
