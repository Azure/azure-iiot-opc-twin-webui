// Copyright (c) Microsoft. All rights reserved.

import { applyMiddleware, compose, createStore } from 'redux';
import { createEpicMiddleware } from 'redux-observable';
import rootEpic from './rootEpic';
import rootReducer from './rootReducer';

export default function configureStore() {
  // Initialize the redux-observable epics
  const epicMiddleware = createEpicMiddleware(rootEpic);

  // Create enhancer composer using redux devtools (if installed in browser)
  const composeEnhancers =
    typeof window === 'object'
    && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
        // Specify extension’s options
        })
      : compose;

  // Initialize enhancer including middleware
  const enhancer = composeEnhancers(
    applyMiddleware(epicMiddleware),
    // add other store enhancers (if any)
  );

  // Initialize the redux store with enhancer
  return createStore(rootReducer, enhancer);
}
