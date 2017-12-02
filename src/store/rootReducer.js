// Copyright (c) Microsoft. All rights reserved.

import { combineReducers } from 'redux';

// Reducers
import { reducer as appReducer } from './reducers/appReducer';
import { reducer as simulationReducer } from './reducers/simulationReducer';

const rootReducer = combineReducers({
  ...appReducer,
  ...simulationReducer
});

export default rootReducer;
