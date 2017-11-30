// Copyright (c) Microsoft. All rights reserved.

import {
  REDUX_SIMULATION_STATUS_UPDATE,
  REDUX_SIMULATION_STATUS_CLEAR,
  REDUX_SIMULATION_UPDATE,
  REDUX_SIMULATION_CLEAR,
  REDUX_SIMULATION_ERROR
} from 'actions';

const initialState = { model: undefined, status: undefined };

export const simulationReducer = (state = initialState, action) => {
  switch (action.type) {
    case REDUX_SIMULATION_UPDATE:
    case REDUX_SIMULATION_CLEAR:
      return { ...state, model: action.payload };
    case REDUX_SIMULATION_STATUS_UPDATE:
    case REDUX_SIMULATION_STATUS_CLEAR:
      return { ...state, status: action.payload };
    case REDUX_SIMULATION_ERROR:
      return { error: action.payload };
    default:
      return state;
  }
};
