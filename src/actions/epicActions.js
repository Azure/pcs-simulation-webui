// Copyright (c) Microsoft. All rights reserved.

// Epic actions trigger redux-observable epics

// Action types - START
export const ROUTE_EVENT = 'ROUTE_EVENT';
export const ROUTE_CHANGE = 'ROUTE_CHANGE';

export const INITIALIZE_APP = 'INITIALIZE_APP';
export const LOAD_SIMULATION_STATUS = 'LOAD_SIMULATION_STATUS';
export const LOAD_SIMULATION = 'LOAD_SIMULATION';
export const LOAD_DEVICE_MODELS = 'LOAD_DEVICE_MODELS';
export const TOGGLE_SIMULATION = 'TOGGLE_SIMULATION';
export const UPDATE_SIMULATION = 'UPDATE_SIMULATION';
// Action types - END

// Actions - START
// App actions
export function routeEvent(pathname) {
  return { type: ROUTE_EVENT, pathname };
}

export function routeChange(pathname) {
  return { type: ROUTE_CHANGE, pathname };
}

export function initializeApp() {
  return { type: INITIALIZE_APP };
}

export function loadDeviceModels() {
  return { type: LOAD_DEVICE_MODELS };
}

// Simulation actions
export function loadSimulationStatus() {
  return { type: LOAD_SIMULATION_STATUS };
}

export function loadSimulation() {
  return { type: LOAD_SIMULATION };
}

export function toggleSimulation(enabled) {
  return { type: TOGGLE_SIMULATION, enabled };
}

export function updateSimulation(modelUpdates) {
  return { type: UPDATE_SIMULATION, modelUpdates };
}
// Actions - END
