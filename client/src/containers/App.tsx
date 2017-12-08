import * as React from 'react';

import { Store } from 'redux';
import AppWrapper from '../components/AppWrapper/AppWrapper';
import Routes from '../components/Routes/Routes';
import IStoreState from '../store/IStoreState';

const App = ({ store }: { store: Store<IStoreState> }) => {
  return (
    <AppWrapper store={store} locale="en">
      <Routes />
    </AppWrapper>
  );
};

export default App;
