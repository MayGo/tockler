import hot from 'dva-hot';
import dva from 'dva';
import router from './router';

import { timelineModel } from './models/timeline';
import 'typeface-berkshire-swash';
import './app.less';

const app = dva();
hot.patch(app);

app.model(timelineModel);

app.router(router);
app.start('#app');
