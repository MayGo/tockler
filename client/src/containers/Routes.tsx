import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import ListContainer from '../containers/ListContainer';
import { TimelinePage } from '../components/Timeline/TimelinePage';

const Routes = () => (
    <Switch>
        <Route exact={true} path="/" component={TimelinePage} />
        <Route exact={true} path="/timeline" component={TimelinePage} />
        <Route exact={true} path="/list" component={ListContainer} />
    </Switch>
);

export default Routes;
