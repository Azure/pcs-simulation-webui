// Copyright (c) Microsoft. All rights reserved.

import { REDUX_DEVICE_MODELS_UPDATE } from 'actions';

export const appReducer = (state = {}, action) => {
  switch (action.type) {
    case REDUX_DEVICE_MODELS_UPDATE:
      return {
        ...state,
        deviceModels: action.payload
      };
    default:
      return state;
  }
};
