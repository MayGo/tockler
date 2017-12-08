import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import Home from '../components/Home/HomeContainer';
import ListContainer from '../containers/ListContainer';

const Routes = () => (
    <Switch>
        <Route exact={true} path="/" component={Home} />
        <Route exact={true} path="/timeline" component={Home} />
        <Route exact={true} path="/list" component={ListContainer} />
    </Switch>
);

export default Routes;
