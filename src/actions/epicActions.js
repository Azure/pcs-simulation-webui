// Copyright (c) Microsoft. All rights reserved.

import { createAction } from 'utilities';

// Epic actions trigger redux-observable epics

// Action names - START
// App Epics
export const EPIC_APP_ROUTE_EVENT = 'EPIC_APP_ROUTE_EVENT';
export const EPIC_APP_ROUTE_CHANGE = 'EPIC_APP_ROUTE_CHANGE';
export const EPIC_APP_INITIALIZE = 'EPIC_APP_INITIALIZE';
export const EPIC_APP_SIMULATION_STATUS_LOAD = 'EPIC_APP_SIMULATION_STATUS_LOAD';
export const EPIC_APP_DEVICE_MODELS_LOAD = 'EPIC_APP_DEVICE_MODELS_LOAD';
// Simulation Epics
export const EPIC_SIMULATION_LOAD = 'EPIC_SIMULATION_LOAD';
export const EPIC_SIMULATION_TOGGLE = 'EPIC_SIMULATION_TOGGLE';
export const EPIC_SIMULATION_UPDATE = 'EPIC_SIMULATION_UPDATE';
// Action names - END

// Actions creators - START
// App actions creators
export const routeEvent = createAction(EPIC_APP_ROUTE_EVENT);
export const routeChangeEvent = createAction(EPIC_APP_ROUTE_CHANGE);
export const initializeAppEvent = createAction(EPIC_APP_INITIALIZE);
export const loadSimulationStatusEvent = createAction(EPIC_APP_SIMULATION_STATUS_LOAD);
export const loadDeviceModelsEvent = createAction(EPIC_APP_DEVICE_MODELS_LOAD);
// Simulation actions creators
export const loadSimulationEvent = createAction(EPIC_SIMULATION_LOAD);
export const toggleSimulationEvent = createAction(EPIC_SIMULATION_TOGGLE);
export const updateSimulationEvent = createAction(EPIC_SIMULATION_UPDATE);
// Actions creators - END
