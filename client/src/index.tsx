import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter as Router } from 'react-router-dom';
import { MainRouter } from './MainRouter';
import { StoreProvider } from 'easy-peasy';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import { mainStore } from './store/mainStore';
import '@fontsource/inter';
import { theme } from './theme/theme';
import ReactGA from 'react-ga4';

const isDev = process.env.NODE_ENV !== 'production';

const trackingId: string = process.env.REACT_APP_TRACKING_ID || '';

ReactGA.initialize(trackingId);

ReactGA.set({
    appVersion: process.env.REACT_APP_VERSION,
    anonymizeIp: true,
    checkProtocolTask: null,
    checkStorageTask: null,
    historyImportTask: null,
});

(window as any).CSPSettings = {
    nonce: 'nonce',
};

if (isDev) {
    console.info('Development!');
    const whyDidYouRender = require('@welldone-software/why-did-you-render');
    whyDidYouRender(React);
}

ReactDOM.render(
    <>
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
        <StoreProvider store={mainStore}>
            <ChakraProvider theme={theme}>
                <Router>
                    <MainRouter />
                </Router>
            </ChakraProvider>
        </StoreProvider>
    </>,
    document.getElementById('root') as HTMLElement,
);
