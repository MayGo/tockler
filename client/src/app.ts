import hot from 'dva-hot';
import dva from 'dva';
import router from './router';

import { timelineModel } from './models/timeline';

import 'antd/dist/antd.css';

const app = dva();
hot.patch(app);

app.model(timelineModel);

app.router(router);
app.start('#app');
