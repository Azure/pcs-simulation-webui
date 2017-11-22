// Copyright (c) Microsoft. All rights reserved.

import { UPDATE_DEVICE_MODELS } from 'actions';

export const app = (state = {}, action) => {
  switch (action.type) {
    case UPDATE_DEVICE_MODELS:
      return { ...state, ...action.payload };
    default:
      return state;
  }
};
