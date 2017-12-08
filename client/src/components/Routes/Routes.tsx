import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import Home from '../../containers/HomeContainer/HomeContainer';

const Routes = () => (
  <Switch>
    <Route path="/" component={Home} />
  </Switch>
);

export default Routes;
