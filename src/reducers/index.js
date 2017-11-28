// Copyright (c) Microsoft. All rights reserved.

import { combineReducers } from 'redux';

// Reducers
import { appReducer } from './appReducer';
import { simulationReducer } from './simulationReducer';

const rootReducer = combineReducers({
  app: appReducer,
  simulation: simulationReducer
});

export default rootReducer;
