import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import '@fontsource/inter';
import { createRoot } from 'react-dom/client';
import { HashRouter as Router } from 'react-router-dom';
import { MainRouter } from './MainRouter';
import { theme } from './theme/theme';
import { setAppParams } from './useGoogleAnalytics.utils';

setAppParams();

// Set CSP settings for the window
// @ts-expect-error - CSPSettings is not defined on Window type
window.CSPSettings = {
    nonce: 'nonce',
};

const root = createRoot(document.getElementById('root') as HTMLElement);

root.render(
    <>
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
        <ChakraProvider theme={theme}>
            <Router>
                <MainRouter />
            </Router>
        </ChakraProvider>
    </>,
);
