// Copyright (c) Microsoft. All rights reserved.

import { combineReducers } from 'redux';

// Reducers
import { reducer as appReducer } from './appReducer';
import { simulationReducer } from './simulationReducer';

const rootReducer = combineReducers({
  ...appReducer,
  simulation: simulationReducer
});

export default rootReducer;
