// Copyright (c) Microsoft. All rights reserved.

import {
  REDUX_SIMULATION_STATUS_UPDATE,
  REDUX_SIMULATION_UPDATE,
  REDUX_SIMULATION_CLEAR,
  REDUX_SIMULATION_ERROR
} from 'actions';

export const simulationReducer = (state = {}, action) => {
  switch (action.type) {
    case REDUX_SIMULATION_UPDATE:
    case REDUX_SIMULATION_CLEAR:
      return { ...state, ...action.payload };
    case REDUX_SIMULATION_ERROR:
      return { error: action.payload };
    case REDUX_SIMULATION_STATUS_UPDATE:
      return { ...state, status: action.payload.simulationStatus };
    default:
      return state;
  }
};
