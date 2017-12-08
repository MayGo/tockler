import * as React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import 'typeface-roboto';
import './index.css';
import AppWrapper from './containers/AppWrapper';
import { store } from './store/store';

const rootEl = document.getElementById('root');

render(
    <AppContainer>
        <AppWrapper store={store} locale="en" />
    </AppContainer>,
    rootEl
);

if (module.hot) {
    module.hot.accept('./containers/AppWrapper', () => {
        const NextApp = require<{
            default: typeof AppWrapper;
        }>('./containers/AppWrapper').default;
        render(
            <AppContainer>
                <NextApp store={store} locale="en" />
            </AppContainer>,
            rootEl
        );
    });
}
