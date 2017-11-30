// Copyright (c) Microsoft. All rights reserved.

import { combineReducers } from 'redux';

// Reducers
import { reducer as appReducer } from './appReducer';
import { reducer as simulationReducer } from './simulationReducer';

const rootReducer = combineReducers({
  ...appReducer,
  ...simulationReducer
});

export default rootReducer;
