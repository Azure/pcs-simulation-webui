// Copyright (c) Microsoft. All rights reserved.

import {
  UPDATE_SIMULATION_STORE,
  CLEAR_SIMULATION_STORE
} from 'actions';

export const simulation = (state = {}, action) => {
  switch (action.type) {
    case UPDATE_SIMULATION_STORE:
    case CLEAR_SIMULATION_STORE:
      return { ...state, ...action.payload };
    default:
      return state;
  }
};
