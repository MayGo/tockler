import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { useGoogleAnalytics } from './useGoogleAnalytics';
import { HomePage } from './routes/HomePage';

export function MainRouter() {
  useGoogleAnalytics();

  return (
    <Switch>
      <Route exact path="/" component={HomePage} />
    </Switch>
  );
}
