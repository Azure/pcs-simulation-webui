// Copyright (c) Microsoft. All rights reserved.

import { combineReducers } from 'redux';

// Reducers
import { app } from './app';
import { simulation } from './simulation';

const rootReducer = combineReducers({
  app,
  simulation
});

export default rootReducer;
