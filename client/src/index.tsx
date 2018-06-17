// import hot from 'dva-hot';
import dva from 'dva';
import router from './router';
import createLoading from 'dva-loading';
import { timelineModel } from './models/timeline';
import 'typeface-berkshire-swash';

import { rootModel } from './models/root';
import { trayModel } from './models/tray';

import { reducer as formReducer } from 'redux-form';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web and AsyncStorage for react-native
import { settingsModel } from './models/settings';
import { summaryModel } from './models/summary';

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

app.model(timelineModel);
app.model(settingsModel);
app.model(trayModel);
app.model(summaryModel);
app.model(rootModel);

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
