import * as React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import 'typeface-roboto';
import IStoreState from './store/IStoreState';
import configureStore from './store/store';
import './index.css';
import AppWrapper from './containers/AppWrapper';

const initialState: IStoreState = {
    routing: null,
    trackItem: {
        all: []
    }
};

const store = configureStore(initialState);
const rootEl = document.getElementById('root');

render(
    <AppContainer>
        <AppWrapper store={store} locale="en" />
    </AppContainer>,
    rootEl
);

if (module.hot) {
    module.hot.accept('./components/AppWrapper', () => {
        const NextApp = require<{
            default: typeof AppWrapper;
        }>('./components/AppWrapper').default;
        render(
            <AppContainer>
                <NextApp store={store} locale="en" />
            </AppContainer>,
            rootEl
        );
    });
}
