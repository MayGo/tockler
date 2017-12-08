import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import TimelineContainer from '../components/Timeline/TimelineContainer';
import ListContainer from '../containers/ListContainer';

const Routes = () => (
    <Switch>
        <Route exact={true} path="/" component={TimelineContainer} />
        <Route exact={true} path="/timeline" component={TimelineContainer} />
        <Route exact={true} path="/list" component={ListContainer} />
    </Switch>
);

export default Routes;
