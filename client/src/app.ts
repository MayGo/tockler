import hot from 'dva-hot';
import dva from 'dva';
import router from './router';

import * as createLoading from 'dva-loading';

import { timelineModel } from './models/timeline';
import 'typeface-berkshire-swash';
import './app.less';
import { rootModel } from './models/root';

const app = dva(createLoading());
hot.patch(app);

app.model(timelineModel);
app.model(rootModel);

app.router(router);
app.start('#app');
