import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter as Router } from 'react-router-dom';
import 'typeface-berkshire-swash';
import { MainRouter } from './router';
import { setupFrontendListener } from 'eiphop';
import { StoreProvider } from 'easy-peasy';
import { ColorModeScript } from '@chakra-ui/react';
import { ChakraProvider } from '@chakra-ui/react';
import { mainStore } from './store/mainStore';
import { theme } from './theme/theme';

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
        <ColorModeScript />
        <ChakraProvider theme={theme}>
            <Router>
                <MainRouter />
            </Router>
        </ChakraProvider>
    </StoreProvider>,
    document.getElementById('root') as HTMLElement,
);
