// Copyright (c) Microsoft. All rights reserved.

import { combineReducers } from 'redux';

// Reducers
// REPLACE with reducer imports

// Added to prevent errors until a real reducer is added
const placeholder = (state = {}, action) => state;

const rootReducer = combineReducers({ 
  placeholder 
});

export default rootReducer;
