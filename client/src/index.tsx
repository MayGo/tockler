import React from 'react';
import ReactDOM from 'react-dom';
import 'typeface-berkshire-swash';
import { MainRouter } from './router';
import { setupFrontendListener } from 'eiphop';
import { AppDataProvider } from './routes/AppDataProvider';
import { StoreProvider } from 'easy-peasy';
import { mainStore } from './store/mainStore';

(window as any).CSPSettings = {
    nonce: 'nonce',
};
const { ipcRenderer } = window as any;

setupFrontendListener({ ipcRenderer } as any);

if (process.env.NODE_ENV !== 'production') {
    const whyDidYouRender = require('@welldone-software/why-did-you-render');
    whyDidYouRender(React);
}

ReactDOM.render(
    <StoreProvider store={mainStore}>
        <AppDataProvider>
            <MainRouter />
        </AppDataProvider>
    </StoreProvider>,
    document.getElementById('root') as HTMLElement,
);
