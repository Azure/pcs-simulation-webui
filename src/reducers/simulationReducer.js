// Copyright (c) Microsoft. All rights reserved.

import { REDUX_SIMULATION_UPDATE, REDUX_SIMULATION_CLEAR } from 'actions';

export const simulationReducer = (state = {}, action) => {
  switch (action.type) {
    case REDUX_SIMULATION_UPDATE:
    case REDUX_SIMULATION_CLEAR:
      return { ...state, ...action.payload };
    default:
      return state;
  }
};
