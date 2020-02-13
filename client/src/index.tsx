import * as Sentry from '@sentry/browser';
import React from 'react';
import ReactDOM from 'react-dom';

import 'typeface-berkshire-swash';
import { MainRouter } from './router';

import { setupFrontendListener } from 'eiphop';
import { AppDataProvider } from './routes/AppDataProvider';

Sentry.init({ dsn: 'https://8b5e35e414d146afac47bbf66d904746@sentry.io/2004797' });

const { ipcRenderer } = window as any;

setupFrontendListener({ ipcRenderer } as any);

if (process.env.NODE_ENV !== 'production') {
    const whyDidYouRender = require('@welldone-software/why-did-you-render');
    whyDidYouRender(React);
}

ReactDOM.render(
    <AppDataProvider>
        <MainRouter />
    </AppDataProvider>,
    document.getElementById('root') as HTMLElement,
);
