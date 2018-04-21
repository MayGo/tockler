// import hot from 'dva-hot';
import dva from 'dva';
import router from './router';

import * as createLoading from 'dva-loading';

import { timelineModel } from './models/timeline';
import 'typeface-berkshire-swash';

import { rootModel } from './models/root';
import { trayModel } from './models/tray';

const app = dva(createLoading());
// hot.patch(app);

app.model(timelineModel);
app.model(trayModel);
app.model(rootModel);

app.router(router);
app.start('#root');

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
