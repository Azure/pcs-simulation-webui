// Copyright (c) Microsoft. All rights reserved.

import { toSimulationModel } from 'services/models';

// Redux actions trigger updates to the redux store

// Action types
export const UPDATE_SIMULATION_STORE = 'UPDATE_SIMULATION_STORE';
export const UPDATE_DEVICE_MODELS = 'UPDATE_DEVICE_MODELS';
export const CLEAR_SIMULATION_STORE = 'CLEAR_SIMULATION_STORE';

// Actions
/** @param {object} payload A UI simulation model object */
export function updateSimulationStore(payload) {
  return { type: UPDATE_SIMULATION_STORE, payload };
}

/** Emits an empty simulation model */
export function clearSimulationStore() {
  return { type: UPDATE_SIMULATION_STORE, payload: toSimulationModel() };
}

export function updateDeviceModels(deviceModels) {
  return { type: UPDATE_DEVICE_MODELS, payload: { deviceModels } };
}
