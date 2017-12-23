import dva from 'dva';
import router from './router';

import { timelineModel } from './models/timeline';

import 'antd/dist/antd.less';

const app = dva();

app.model(timelineModel);

app.router(router);
app.start('#app');
