import { compose, createStore, applyMiddleware } from 'redux';
import rootReducer from './reducers';
import createSagaMiddleware from 'redux-saga';

import { routerMiddleware } from 'react-router-redux'
import sagas from './sagas/rootSaga';
import createHistory from 'history/createBrowserHistory';
import IStoreState from './IStoreState';


console.log('Creating history');
export const appHistory:any = createHistory()


const initialState: IStoreState = {
  routing: null,
  trackItem: {
      all: []
  },
  timeline: {
      series: null,
      timerange: null,
  }
};


 function configureStore(initialState?: any) {
  console.log('Configuring store.');

 
  const historyMiddleware = routerMiddleware(appHistory)
  const sagaMiddleware = createSagaMiddleware();
  const middlewares = [historyMiddleware,sagaMiddleware];

  //const enhancers = [applyMiddleware(...middlewares)];

  // If Redux DevTools Extension is installed use it, otherwise use Redux compose
  const composeEnhancers =
    process.env.NODE_ENV !== 'production' &&
    typeof window === 'object' &&
    (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      ? (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
          // TODO Try to remove when `react-router-redux` is out of beta,
          // LOCATION_CHANGE should not be fired more than once after hot reloading
          // Prevent recomputing reducers for `replaceReducer`
          shouldHotReload: false,
        })
      : compose;

  const store = createStore(rootReducer,
    initialState,
    
    composeEnhancers(applyMiddleware(...middlewares)),
  );

  sagaMiddleware.run(sagas);

  if (module.hot) {
    module.hot.accept('./reducers', () => {
      const reducers = require('./reducers').default;
      store.replaceReducer(reducers);
    });
  }

  return store;
}

export const store = configureStore(initialState)
