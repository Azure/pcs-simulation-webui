// Copyright (c) Microsoft. All rights reserved.

// Redux actions trigger updates to the redux store

// Action types
export const PLACEHOLDER = 'PLACEHOLDER';
export const LOAD_DEVICE_MODELS_SUCCESS = 'LOAD_DEVICE_MODELS_SUCCESS';

// Actions
export function placeholder() {
  return { type: PLACEHOLDER };
}

export const loadDeviceModelsSuccess = payload => ({
  type: LOAD_DEVICE_MODELS_SUCCESS,
  payload
});
