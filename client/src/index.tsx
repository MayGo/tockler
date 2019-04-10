// import hot from 'dva-hot';
import * as React from 'react';
import dva from 'dva';
import router from './router';
import createLoading from 'dva-loading';

import 'typeface-berkshire-swash';

import { reducer as formReducer } from 'redux-form';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web and AsyncStorage for react-native
import { whyDidYouUpdate } from 'why-did-you-update';
if (process.env.NODE_ENV !== 'production') {
    const { whyDidYouUpdate } = require('why-did-you-update');
    /*  whyDidYouUpdate(React, {
        groupByComponent: true,
        collapseComponentGroups: true,
    });*/
}

const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['settings.work'],
};

const app = dva({
    extraReducers: {
        form: formReducer,
    },
    onReducer: reducer => {
        return persistReducer(persistConfig, reducer);
    },
});
app.use(createLoading());
// hot.patch(app);

app.router(router);
app.start('#root');

persistStore(app._store);

/*import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import './index.scss';

ReactDOM.render(
  <App />,
  document.getElementById('root') as HTMLElement
);
registerServiceWorker();*/
