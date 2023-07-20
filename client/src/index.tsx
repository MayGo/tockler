import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter as Router } from 'react-router-dom';
import { MainRouter } from './MainRouter';
import { StoreProvider } from 'easy-peasy';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import { mainStore } from './store/mainStore';
import '@fontsource/inter';
import { theme } from './theme/theme';
import { setAppParams } from './useGoogleAnalytics.utils';

const isDev = process.env.NODE_ENV !== 'production';

setAppParams();

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
