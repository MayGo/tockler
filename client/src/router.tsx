import * as React from 'react';

import { Router, Route, Switch } from 'dva/router';
import Timeline from './routes/Timeline';
import NotFound from './routes/404';

export default function({ history }: any) {
    return (
        <Router history={history}>
            <Switch>
                <Route path="/" component={Timeline} />
                <Route path="*" component={NotFound} />
            </Switch>
        </Router>
    );
}
