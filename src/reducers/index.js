// Copyright (c) Microsoft. All rights reserved.

import { combineReducers } from 'redux';
import { simulation } from './simulationReducer';

// Reducers
// TODO: Replace with reducer imports

// Added to prevent errors until a real reducer is added
const placeholder = (state = {}, action) => state;

const rootReducer = combineReducers({
  placeholder,
  simulation
});

export default rootReducer;
