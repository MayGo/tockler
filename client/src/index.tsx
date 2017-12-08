import * as React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import 'typeface-roboto';
import App from './containers/App';
import IStoreState from './store/IStoreState';
import configureStore from './store/store';
import './index.css';

const initialState: IStoreState = {
    trackItem: {
        all: []
    }
};

const store = configureStore(initialState);
const rootEl = document.getElementById('root');

render(
    <AppContainer>
        <App store={store} />
    </AppContainer>,
    rootEl
);

if (module.hot) {
    module.hot.accept('./containers/App', () => {
        const NextApp = require<{ default: typeof App }>('./containers/App')
            .default;
        render(
            <AppContainer>
                <NextApp store={store} />
            </AppContainer>,
            rootEl
        );
    });
}
